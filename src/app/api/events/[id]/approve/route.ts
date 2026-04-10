import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { events, eventApprovalLog } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { z } from "zod/v4";
import { logActivity } from "@/lib/activity";

const approveSchema = z.object({
  action: z.enum(["approved", "rejected", "changes_requested"]),
  comment: z.string().optional(),
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

  // Only admin or super_admin can approve/reject
  if (user.role !== "admin" && user.role !== "super_admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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

  if (event.status !== "pending_approval") {
    return NextResponse.json(
      { error: "Only events pending approval can be reviewed." },
      { status: 400 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = approveSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.issues },
      { status: 400 }
    );
  }

  const { action, comment } = parsed.data;

  // Map action to new status
  const statusMap: Record<string, "scheduled" | "cancelled" | "draft"> = {
    approved: "scheduled",
    rejected: "cancelled",
    changes_requested: "draft",
  };

  const newStatus = statusMap[action];

  const updated = await db.transaction(async (tx) => {
    const [reviewedEvent] = await tx
      .update(events)
      .set({ status: newStatus, updatedAt: new Date() })
      .where(eq(events.id, id))
      .returning();

    await tx.insert(eventApprovalLog).values({
      eventId: id,
      action,
      actorId: user.id,
      comment: comment ?? null,
    });

    return reviewedEvent;
  });

  const actionLabels: Record<string, string> = {
    approved: "Approved",
    rejected: "Rejected",
    changes_requested: "Requested changes on",
  };

  await logActivity({
    actorId: user.id,
    action: `event.${action}`,
    entityType: "event",
    entityId: id,
    description: `${actionLabels[action]} event "${event.title}"`,
    metadata: comment ? { comment } : undefined,
  });

  return NextResponse.json({ event: updated });
}
