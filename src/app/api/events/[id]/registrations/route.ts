import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { events, eventRegistrations, leads } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { eq } from "drizzle-orm";

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

  // Verify the event exists and the user has access
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

  // Get all registrations with lead details
  const registrations = await db
    .select({
      id: eventRegistrations.id,
      status: eventRegistrations.status,
      checkedInAt: eventRegistrations.checkedInAt,
      createdAt: eventRegistrations.createdAt,
      lead: {
        id: leads.id,
        firstName: leads.firstName,
        lastName: leads.lastName,
        email: leads.email,
        phone: leads.phone,
      },
    })
    .from(eventRegistrations)
    .innerJoin(leads, eq(eventRegistrations.leadId, leads.id))
    .where(eq(eventRegistrations.eventId, id));

  return NextResponse.json({ registrations });
}
