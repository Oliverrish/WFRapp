import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { events, eventRegistrations } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { eq, and, desc, sql } from "drizzle-orm";
import { z } from "zod/v4";
import { logActivity } from "@/lib/activity";

const checkInSchema = z.union([
  z.object({ registrationId: z.string().uuid() }),
  z.object({ leadId: z.string().uuid() }),
]);

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

  const parsed = checkInSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed. Provide registrationId or leadId.", details: parsed.error.issues },
      { status: 400 }
    );
  }

  const data = parsed.data;
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

    const registrationWhere = "registrationId" in data
      ? and(
          eq(eventRegistrations.id, data.registrationId),
          eq(eventRegistrations.eventId, eventId)
        )
      : and(
          eq(eventRegistrations.leadId, data.leadId),
          eq(eventRegistrations.eventId, eventId)
        );

    const [registration] = await tx
      .select()
      .from(eventRegistrations)
      .where(registrationWhere)
      .orderBy(desc(eventRegistrations.createdAt))
      .limit(1);

    if (!registration) {
      return { kind: "missing_registration" as const };
    }

    if (registration.status === "checked_in") {
      return {
        kind: "existing" as const,
        registration,
      };
    }

    const checkedInAt = registration.checkedInAt ?? new Date();
    const [updated] = await tx
      .update(eventRegistrations)
      .set({ status: "checked_in", checkedInAt })
      .where(eq(eventRegistrations.id, registration.id))
      .returning();

    return {
      kind: "updated" as const,
      registration: updated,
    };
  });

  if (outcome.kind === "not_found") {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  if (outcome.kind === "forbidden") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (outcome.kind === "missing_registration") {
    return NextResponse.json(
      { error: "Registration not found for this event" },
      { status: 404 }
    );
  }

  if (outcome.kind === "updated") {
    await logActivity({
      actorId: user.id,
      action: "checkin.completed",
      entityType: "registration",
      entityId: outcome.registration.id,
      description: `Checked in attendee for event`,
    });
  }

  return NextResponse.json({ registration: outcome.registration });
}
