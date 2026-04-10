import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { events, eventRegistrations } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { eq, and } from "drizzle-orm";
import { z } from "zod/v4";

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

  const parsed = checkInSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed. Provide registrationId or leadId.", details: parsed.error.issues },
      { status: 400 }
    );
  }

  const data = parsed.data;

  // Find the registration
  let registration;
  if ("registrationId" in data) {
    const [found] = await db
      .select()
      .from(eventRegistrations)
      .where(
        and(
          eq(eventRegistrations.id, data.registrationId),
          eq(eventRegistrations.eventId, eventId)
        )
      )
      .limit(1);
    registration = found;
  } else {
    const [found] = await db
      .select()
      .from(eventRegistrations)
      .where(
        and(
          eq(eventRegistrations.leadId, data.leadId),
          eq(eventRegistrations.eventId, eventId)
        )
      )
      .limit(1);
    registration = found;
  }

  if (!registration) {
    return NextResponse.json(
      { error: "Registration not found for this event" },
      { status: 404 }
    );
  }

  // Update to checked_in
  const [updated] = await db
    .update(eventRegistrations)
    .set({ status: "checked_in", checkedInAt: new Date() })
    .where(eq(eventRegistrations.id, registration.id))
    .returning();

  return NextResponse.json({ registration: updated });
}
