import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { events, eventRegistrations, leads } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { eq, sql, and } from "drizzle-orm";
import { z } from "zod/v4";

const updateEventSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  startDatetime: z.string().optional(),
  endDatetime: z.string().optional(),
  locationName: z.string().optional(),
  locationAddress: z.string().optional(),
  capacity: z.number().int().positive().optional(),
  notes: z.string().optional(),
  timezone: z.string().optional(),
  templateId: z.string().uuid().optional(),
  status: z
    .enum(["draft", "pending_approval", "scheduled", "live", "completed", "cancelled"])
    .optional(),
});

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(
  _request: NextRequest,
  context: RouteContext
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await context.params;

  const [event] = await db
    .select()
    .from(events)
    .where(eq(events.id, id))
    .limit(1);

  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  // Only owner or admin can view
  const isAdmin = user.role === "admin" || user.role === "super_admin";
  if (event.advisorId !== user.id && !isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Get registration count
  const [counts] = await db
    .select({
      registrationCount: sql<number>`count(${eventRegistrations.id})::int`,
      checkedInCount: sql<number>`count(case when ${eventRegistrations.status} = 'checked_in' then 1 end)::int`,
    })
    .from(eventRegistrations)
    .where(eq(eventRegistrations.eventId, id));

  // Get attendee list with lead details
  const attendees = await db
    .select({
      registrationId: eventRegistrations.id,
      status: eventRegistrations.status,
      checkedInAt: eventRegistrations.checkedInAt,
      createdAt: eventRegistrations.createdAt,
      leadId: leads.id,
      firstName: leads.firstName,
      lastName: leads.lastName,
      email: leads.email,
      phone: leads.phone,
    })
    .from(eventRegistrations)
    .innerJoin(leads, eq(eventRegistrations.leadId, leads.id))
    .where(eq(eventRegistrations.eventId, id));

  return NextResponse.json({
    event,
    registrationCount: counts?.registrationCount ?? 0,
    checkedInCount: counts?.checkedInCount ?? 0,
    attendees,
  });
}

export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await context.params;

  const [event] = await db
    .select()
    .from(events)
    .where(eq(events.id, id))
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

  const parsed = updateEventSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.issues },
      { status: 400 }
    );
  }

  const data = parsed.data;

  // Build update object with only provided fields
  const updateData: Record<string, unknown> = { updatedAt: new Date() };
  if (data.title !== undefined) updateData.title = data.title;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.startDatetime !== undefined) updateData.startDatetime = new Date(data.startDatetime);
  if (data.endDatetime !== undefined) updateData.endDatetime = new Date(data.endDatetime);
  if (data.locationName !== undefined) updateData.locationName = data.locationName;
  if (data.locationAddress !== undefined) updateData.locationAddress = data.locationAddress;
  if (data.capacity !== undefined) updateData.capacity = data.capacity;
  if (data.notes !== undefined) updateData.notes = data.notes;
  if (data.timezone !== undefined) updateData.timezone = data.timezone;
  if (data.templateId !== undefined) updateData.templateId = data.templateId;
  if (data.status !== undefined) updateData.status = data.status;

  const [updated] = await db
    .update(events)
    .set(updateData)
    .where(eq(events.id, id))
    .returning();

  return NextResponse.json({ event: updated });
}

export async function DELETE(
  _request: NextRequest,
  context: RouteContext
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await context.params;

  const [event] = await db
    .select()
    .from(events)
    .where(eq(events.id, id))
    .limit(1);

  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  const isAdmin = user.role === "admin" || user.role === "super_admin";
  if (event.advisorId !== user.id && !isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await db.delete(events).where(eq(events.id, id));

  return NextResponse.json({ success: true });
}
