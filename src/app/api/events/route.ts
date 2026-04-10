import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { events, eventRegistrations } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { eq, sql, desc } from "drizzle-orm";
import { z } from "zod/v4";
import { logActivity } from "@/lib/activity";

const createEventSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  startDatetime: z.string(),
  endDatetime: z.string(),
  locationName: z.string().optional(),
  locationAddress: z.string().optional(),
  capacity: z.number().int().positive().optional(),
  notes: z.string().optional(),
  timezone: z.string().optional(),
  templateId: z.string().uuid().optional(),
  status: z.enum(["draft", "pending_approval"]).default("draft"),
});

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Admins/super_admins see all events; advisors see only their own
  const isAdmin = user.role === "admin" || user.role === "super_admin";

  const result = await db
    .select({
      id: events.id,
      title: events.title,
      status: events.status,
      locationName: events.locationName,
      locationAddress: events.locationAddress,
      startDatetime: events.startDatetime,
      endDatetime: events.endDatetime,
      capacity: events.capacity,
      advisorId: events.advisorId,
      registrationCount: sql<number>`count(${eventRegistrations.id})::int`,
      checkedInCount: sql<number>`count(case when ${eventRegistrations.status} = 'checked_in' then 1 end)::int`,
    })
    .from(events)
    .leftJoin(eventRegistrations, eq(events.id, eventRegistrations.eventId))
    .where(isAdmin ? undefined : eq(events.advisorId, user.id))
    .groupBy(events.id)
    .orderBy(desc(events.startDatetime));

  return NextResponse.json({ events: result });
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = createEventSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.issues },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const startDatetime = new Date(data.startDatetime);
  const endDatetime = new Date(data.endDatetime);

  if (
    Number.isNaN(startDatetime.getTime()) ||
    Number.isNaN(endDatetime.getTime())
  ) {
    return NextResponse.json(
      { error: "Invalid event date or time." },
      { status: 400 }
    );
  }

  if (endDatetime <= startDatetime) {
    return NextResponse.json(
      { error: "Event end time must be after the start time." },
      { status: 400 }
    );
  }

  const [created] = await db
    .insert(events)
    .values({
      advisorId: user.id,
      title: data.title,
      description: data.description ?? null,
      startDatetime,
      endDatetime,
      locationName: data.locationName ?? null,
      locationAddress: data.locationAddress ?? null,
      capacity: data.capacity ?? null,
      notes: data.notes ?? null,
      timezone: data.timezone ?? "America/New_York",
      templateId: data.templateId ?? null,
      status: data.status,
    })
    .returning();

  await logActivity({
    actorId: user.id,
    action: "event.created",
    entityType: "event",
    entityId: created.id,
    description: `Created event "${created.title}"`,
  });

  return NextResponse.json({ event: created }, { status: 201 });
}
