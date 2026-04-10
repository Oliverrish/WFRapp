import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { leads, eventRegistrations } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { eq, sql, desc } from "drizzle-orm";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const isAdmin = user.role === "admin" || user.role === "super_admin";

  const result = await db
    .select({
      id: leads.id,
      advisorId: leads.advisorId,
      firstName: leads.firstName,
      lastName: leads.lastName,
      email: leads.email,
      phone: leads.phone,
      createdAt: leads.createdAt,
      updatedAt: leads.updatedAt,
      eventCount: sql<number>`count(${eventRegistrations.id})::int`,
    })
    .from(leads)
    .leftJoin(eventRegistrations, eq(leads.id, eventRegistrations.leadId))
    .where(isAdmin ? undefined : eq(leads.advisorId, user.id))
    .groupBy(leads.id)
    .orderBy(desc(leads.createdAt));

  return NextResponse.json({ leads: result });
}
