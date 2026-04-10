import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import type { Profile, UserRole } from "@/types";

export function getHomeRouteForRole(role: UserRole) {
  if (role === "advisor") {
    return "/events";
  }

  return "/admin/dashboard";
}

export async function requireMinimumRole(
  minimumRole: "admin" | "super_admin"
): Promise<Profile> {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (minimumRole === "super_admin" && user.role !== "super_admin") {
    redirect(getHomeRouteForRole(user.role));
  }

  if (minimumRole === "admin" && user.role === "advisor") {
    redirect("/events");
  }

  return user;
}
