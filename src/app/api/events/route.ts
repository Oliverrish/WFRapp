import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { events, eventRegistrations } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { eq, sql, desc } from "drizzle-orm";

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
