import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { events, leads, eventRegistrations, profiles } from "@/lib/db/schema";
import { getCurrentUser, normalizeEmail } from "@/lib/auth";
import { eq, and, or, desc, sql } from "drizzle-orm";
import { z } from "zod/v4";
import { logActivity } from "@/lib/activity";

function optionalTextSchema() {
  return z.preprocess(
    (value) => {
      if (typeof value !== "string") {
        return value;
      }

      const trimmed = value.trim();
      return trimmed.length > 0 ? trimmed : undefined;
    },
    z.string().optional()
  );
}

const walkInSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
  email: z.preprocess(
    (value) => {
      if (typeof value !== "string") {
        return value;
      }

      const trimmed = value.trim();
      return trimmed.length > 0 ? trimmed : undefined;
    },
    z.string().email().optional()
  ),
  phone: optionalTextSchema(),
});

type LeadRecord = {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
};

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(
  request: NextRequest,
  context: RouteContext
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id: eventId } = await context.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = walkInSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.issues },
      { status: 400 }
    );
  }

  const { firstName, lastName, email, phone } = parsed.data;
  const outcome = await db.transaction(async (tx) => {
    const [event] = await tx
      .select()
      .from(events)
      .where(eq(events.id, eventId))
      .limit(1);

    if (!event) {
      return { kind: "not_found" as const };
    }

    const isAdmin = user.role === "admin" || user.role === "super_admin";
    if (event.advisorId !== user.id && !isAdmin) {
      return { kind: "forbidden" as const };
    }

    await tx.execute(sql`SELECT 1 FROM ${events} WHERE ${events.id} = ${eventId} FOR UPDATE`);
    await tx.execute(sql`SELECT 1 FROM ${profiles} WHERE ${profiles.id} = ${event.advisorId} FOR UPDATE`);

    const normalizedEmail = email ? normalizeEmail(email) : null;
    const normalizedPhone = phone ?? null;

    let lead: LeadRecord | null = null;
    if (normalizedEmail || normalizedPhone) {
      const conditions = [];
      if (normalizedEmail) {
        conditions.push(eq(leads.email, normalizedEmail));
      }
      if (normalizedPhone) {
        conditions.push(eq(leads.phone, normalizedPhone));
      }

      const [existingLead] = await tx
        .select()
        .from(leads)
        .where(
          and(
            eq(leads.advisorId, event.advisorId),
            conditions.length > 1 ? or(...conditions) : conditions[0]
          )
        )
        .orderBy(desc(leads.createdAt))
        .limit(1);

      lead = existingLead ?? null;
    }

    if (!lead) {
      const [createdLead] = await tx
        .insert(leads)
        .values({
          advisorId: event.advisorId,
          firstName,
          lastName,
          email: normalizedEmail,
          phone: normalizedPhone,
        })
        .returning();

      lead = createdLead;
    }

    const [existingRegistration] = await tx
      .select()
      .from(eventRegistrations)
      .where(
        and(
          eq(eventRegistrations.eventId, eventId),
          eq(eventRegistrations.leadId, lead.id)
        )
      )
      .orderBy(desc(eventRegistrations.createdAt))
      .limit(1);

    if (existingRegistration) {
      if (existingRegistration.status === "checked_in") {
        return {
          kind: "existing" as const,
          lead,
          registration: existingRegistration,
        };
      }

      const [updatedRegistration] = await tx
        .update(eventRegistrations)
        .set({ status: "checked_in", checkedInAt: new Date() })
        .where(eq(eventRegistrations.id, existingRegistration.id))
        .returning();

      return {
        kind: "updated" as const,
        lead,
        registration: updatedRegistration,
      };
    }

    const [registration] = await tx
      .insert(eventRegistrations)
      .values({
        eventId,
        leadId: lead.id,
        status: "checked_in",
        checkedInAt: new Date(),
      })
      .returning();

    return {
      kind: "created" as const,
      lead,
      registration,
    };
  });

  if (outcome.kind === "not_found") {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  if (outcome.kind === "forbidden") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (outcome.kind !== "existing") {
    await logActivity({
      actorId: user.id,
      action: "walkin.added",
      entityType: "lead",
      entityId: outcome.lead.id,
      description: `Walk-in: ${outcome.lead.firstName} ${outcome.lead.lastName} checked in`,
    });
  }

  return NextResponse.json(
    { lead: outcome.lead, registration: outcome.registration },
    { status: outcome.kind === "created" ? 201 : 200 }
  );
}
