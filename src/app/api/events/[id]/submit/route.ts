import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { events, eventApprovalLog } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { logActivity } from "@/lib/activity";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(
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

  // Only the event owner can submit
  if (event.advisorId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (event.status !== "draft") {
    return NextResponse.json(
      { error: "Only draft events can be submitted for approval" },
      { status: 400 }
    );
  }

  const updated = await db.transaction(async (tx) => {
    const [submittedEvent] = await tx
      .update(events)
      .set({ status: "pending_approval", updatedAt: new Date() })
      .where(eq(events.id, id))
      .returning();

    await tx.insert(eventApprovalLog).values({
      eventId: id,
      action: "submitted",
      actorId: user.id,
    });

    return submittedEvent;
  });

  await logActivity({
    actorId: user.id,
    action: "event.submitted",
    entityType: "event",
    entityId: id,
    description: `Submitted event "${event.title}" for approval`,
  });

  return NextResponse.json({ event: updated });
}
