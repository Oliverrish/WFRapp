import type { InferSelectModel } from "drizzle-orm";
import type {
  profiles,
  leads,
  events,
  eventRegistrations,
  eventTemplates,
  eventApprovalLog,
  adminScopes,
  files,
  sessions,
} from "@/lib/db/schema";

export type Profile = InferSelectModel<typeof profiles>;
export type Lead = InferSelectModel<typeof leads>;
export type Event = InferSelectModel<typeof events>;
export type EventRegistration = InferSelectModel<typeof eventRegistrations>;
export type EventTemplate = InferSelectModel<typeof eventTemplates>;
export type EventApprovalLog = InferSelectModel<typeof eventApprovalLog>;
export type AdminScope = InferSelectModel<typeof adminScopes>;
export type FileRecord = InferSelectModel<typeof files>;
export type Session = InferSelectModel<typeof sessions>;

export type UserRole = "advisor" | "admin" | "super_admin";

export type EventStatus =
  | "draft"
  | "pending_approval"
  | "scheduled"
  | "live"
  | "completed"
  | "cancelled";

export type RegistrationStatus = "registered" | "checked_in" | "no_show";
