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
  userRoleEnum,
  eventStatusEnum,
  registrationStatusEnum,
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

export type UserRole = (typeof userRoleEnum.enumValues)[number];

export type EventStatus = (typeof eventStatusEnum.enumValues)[number];

export type RegistrationStatus = (typeof registrationStatusEnum.enumValues)[number];
