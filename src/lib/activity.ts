import { db } from "@/lib/db";
import { activityLog } from "@/lib/db/schema";

interface LogActivityParams {
  actorId: string;
  action: string;
  entityType: string;
  entityId?: string;
  description: string;
  metadata?: Record<string, unknown>;
}

export async function logActivity(params: LogActivityParams) {
  try {
    await db.insert(activityLog).values({
      actorId: params.actorId,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId ?? null,
      description: params.description,
      metadata: params.metadata ? JSON.stringify(params.metadata) : null,
    });
  } catch (error) {
    // Don't let logging failures break the main flow
    console.error("Failed to log activity:", error);
  }
}
