import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { events, leads, eventRegistrations } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { eq, and, or } from "drizzle-orm";
import { z } from "zod/v4";

const walkInSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email().optional(),
  phone: z.string().optional(),
});

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

  // Verify the event exists
  const [event] = await db
    .select()
    .from(events)
    .where(eq(events.id, eventId))
    .limit(1);

  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  const isAdmin = user.role === "admin" || user.role === "super_admin";
  if (event.advisorId !== user.id && !isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

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

  // Try to find existing lead by email or phone (dedup)
  let lead = null;

  if (email || phone) {
    const conditions = [];
    if (email) conditions.push(eq(leads.email, email));
    if (phone) conditions.push(eq(leads.phone, phone));

    const [existing] = await db
      .select()
      .from(leads)
      .where(
        and(
          eq(leads.advisorId, event.advisorId),
          conditions.length > 1 ? or(...conditions) : conditions[0]
        )
      )
      .limit(1);

    lead = existing ?? null;
  }

  // Create lead if not found
  if (!lead) {
    const [created] = await db
      .insert(leads)
      .values({
        advisorId: event.advisorId,
        firstName,
        lastName,
        email: email ?? null,
        phone: phone ?? null,
      })
      .returning();
    lead = created;
  }

  // Check if already registered for this event
  const [existingReg] = await db
    .select()
    .from(eventRegistrations)
    .where(
      and(
        eq(eventRegistrations.eventId, eventId),
        eq(eventRegistrations.leadId, lead.id)
      )
    )
    .limit(1);

  if (existingReg) {
    // Update existing registration to checked_in
    const [updated] = await db
      .update(eventRegistrations)
      .set({ status: "checked_in", checkedInAt: new Date() })
      .where(eq(eventRegistrations.id, existingReg.id))
      .returning();

    return NextResponse.json({ lead, registration: updated });
  }

  // Create new registration as checked_in
  const [registration] = await db
    .insert(eventRegistrations)
    .values({
      eventId,
      leadId: lead.id,
      status: "checked_in",
      checkedInAt: new Date(),
    })
    .returning();

  return NextResponse.json({ lead, registration }, { status: 201 });
}
