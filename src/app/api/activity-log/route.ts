import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { activityLog, profiles } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { eq, desc, and, gte, lte, like, sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Only admins can view the activity log
  if (user.role !== "admin" && user.role !== "super_admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = request.nextUrl;
  const entityType = searchParams.get("entityType");
  const action = searchParams.get("action");
  const actorId = searchParams.get("actorId");
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const search = searchParams.get("search");
  const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 200);
  const offset = parseInt(searchParams.get("offset") || "0");

  // Build filter conditions
  const conditions = [];
  if (entityType) conditions.push(eq(activityLog.entityType, entityType));
  if (action) conditions.push(like(activityLog.action, `%${action}%`));
  if (actorId) conditions.push(eq(activityLog.actorId, actorId));
  if (from) conditions.push(gte(activityLog.createdAt, new Date(from)));
  if (to) conditions.push(lte(activityLog.createdAt, new Date(to)));
  if (search) conditions.push(like(activityLog.description, `%${search}%`));

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [logs, [countResult]] = await Promise.all([
    db
      .select({
        id: activityLog.id,
        action: activityLog.action,
        entityType: activityLog.entityType,
        entityId: activityLog.entityId,
        description: activityLog.description,
        metadata: activityLog.metadata,
        createdAt: activityLog.createdAt,
        actorId: activityLog.actorId,
        actorName: profiles.fullName,
        actorEmail: profiles.email,
        actorRole: profiles.role,
      })
      .from(activityLog)
      .innerJoin(profiles, eq(activityLog.actorId, profiles.id))
      .where(where)
      .orderBy(desc(activityLog.createdAt))
      .limit(limit)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(activityLog)
      .where(where),
  ]);

  return NextResponse.json({
    logs,
    total: countResult?.count ?? 0,
    limit,
    offset,
  });
}
