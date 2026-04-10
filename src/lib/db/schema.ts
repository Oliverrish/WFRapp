import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  boolean,
  integer,
  pgEnum,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

// ── Enums ──────────────────────────────────────────────

export const userRoleEnum = pgEnum("user_role", [
  "advisor",
  "admin",
  "super_admin",
]);

export const eventStatusEnum = pgEnum("event_status", [
  "draft",
  "pending_approval",
  "scheduled",
  "live",
  "completed",
  "cancelled",
]);

export const registrationStatusEnum = pgEnum("registration_status", [
  "registered",
  "checked_in",
  "no_show",
]);

export const approvalActionEnum = pgEnum("approval_action", [
  "submitted",
  "approved",
  "rejected",
  "changes_requested",
]);

// ── Profiles ───────────────────────────────────────────

export const profiles = pgTable("profiles", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  role: userRoleEnum("role").notNull().default("advisor"),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ── Admin Scopes (scoped permissions for admin role) ───

export const adminScopes = pgTable(
  "admin_scopes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    adminId: uuid("admin_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    advisorId: uuid("advisor_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    canEditEvents: boolean("can_edit_events").default(false).notNull(),
    canViewLeads: boolean("can_view_leads").default(false).notNull(),
    canManageTemplates: boolean("can_manage_templates").default(false).notNull(),
    canViewReports: boolean("can_view_reports").default(false).notNull(),
  },
  (table) => [
    uniqueIndex("admin_scopes_admin_id_advisor_id_unique").on(
      table.adminId,
      table.advisorId,
    ),
    index("admin_scopes_advisor_id_idx").on(table.advisorId),
  ],
);

// ── OTP Codes ──────────────────────────────────────────

export const otpCodes = pgTable(
  "otp_codes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    email: varchar("email", { length: 255 }).notNull(),
    code: varchar("code", { length: 6 }),
    codeHash: text("code_hash"),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    attempts: integer("attempts").default(0).notNull(),
    usedAt: timestamp("used_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("otp_codes_email_idx").on(table.email),
    index("otp_codes_email_code_idx").on(table.email, table.code),
    index("otp_codes_email_code_hash_idx").on(table.email, table.codeHash),
    index("otp_codes_email_expires_at_idx").on(table.email, table.expiresAt),
  ],
);

// ── Sessions ───────────────────────────────────────────

export const sessions = pgTable(
  "sessions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    profileId: uuid("profile_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    token: varchar("token", { length: 255 }).notNull().unique(),
    userAgent: text("user_agent"),
    ipAddress: varchar("ip_address", { length: 45 }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    lastActiveAt: timestamp("last_active_at", { withTimezone: true }).defaultNow().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("sessions_profile_id_idx").on(table.profileId),
    index("sessions_profile_id_expires_at_idx").on(table.profileId, table.expiresAt),
    index("sessions_expires_at_idx").on(table.expiresAt),
  ],
);

// ── Leads ──────────────────────────────────────────────

export const leads = pgTable(
  "leads",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    advisorId: uuid("advisor_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    firstName: varchar("first_name", { length: 255 }).notNull(),
    lastName: varchar("last_name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }),
    phone: varchar("phone", { length: 50 }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("leads_advisor_id_idx").on(table.advisorId),
    index("leads_advisor_id_created_at_idx").on(table.advisorId, table.createdAt),
    index("leads_email_idx").on(table.email),
  ],
);

// ── Event Templates ────────────────────────────────────

export const eventTemplates = pgTable("event_templates", {
  id: uuid("id").defaultRandom().primaryKey(),
  templateName: varchar("template_name", { length: 255 }).notNull(),
  defaultTitle: varchar("default_title", { length: 255 }),
  defaultDuration: integer("default_duration"),
  defaultLocation: varchar("default_location", { length: 500 }),
  defaultNotes: text("default_notes"),
  defaultEventType: varchar("default_event_type", { length: 100 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ── Events ─────────────────────────────────────────────

export const events = pgTable(
  "events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    advisorId: uuid("advisor_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    templateId: uuid("template_id").references(() => eventTemplates.id, {
      onDelete: "set null",
    }),
    title: varchar("title", { length: 500 }).notNull(),
    description: text("description"),
    status: eventStatusEnum("status").notNull().default("draft"),
    locationName: varchar("location_name", { length: 500 }),
    locationAddress: text("location_address"),
    startDatetime: timestamp("start_datetime", { withTimezone: true }).notNull(),
    endDatetime: timestamp("end_datetime", { withTimezone: true }).notNull(),
    timezone: varchar("timezone", { length: 100 }).default("America/New_York"),
    capacity: integer("capacity"),
    notes: text("notes"),
    repeatRule: varchar("repeat_rule", { length: 50 }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("events_advisor_id_idx").on(table.advisorId),
    index("events_advisor_id_start_datetime_idx").on(table.advisorId, table.startDatetime),
    index("events_template_id_idx").on(table.templateId),
    index("events_status_idx").on(table.status),
  ],
);

// ── Event Registrations ────────────────────────────────

export const eventRegistrations = pgTable(
  "event_registrations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    eventId: uuid("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    leadId: uuid("lead_id")
      .notNull()
      .references(() => leads.id, { onDelete: "cascade" }),
    status: registrationStatusEnum("status").notNull().default("registered"),
    checkedInAt: timestamp("checked_in_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("event_registrations_event_id_lead_id_unique").on(
      table.eventId,
      table.leadId,
    ),
    index("event_registrations_event_id_idx").on(table.eventId),
    index("event_registrations_event_id_created_at_idx").on(table.eventId, table.createdAt),
    index("event_registrations_lead_id_idx").on(table.leadId),
  ],
);

// ── Event Approval Log ─────────────────────────────────

export const eventApprovalLog = pgTable(
  "event_approval_log",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    eventId: uuid("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    action: approvalActionEnum("action").notNull(),
    actorId: uuid("actor_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    comment: text("comment"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("event_approval_log_event_id_idx").on(table.eventId),
    index("event_approval_log_event_id_created_at_idx").on(table.eventId, table.createdAt),
    index("event_approval_log_actor_id_idx").on(table.actorId),
    index("event_approval_log_actor_id_created_at_idx").on(table.actorId, table.createdAt),
  ],
);

// ── Activity Log ───────────────────────────────────────

export const activityLog = pgTable(
  "activity_log",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    actorId: uuid("actor_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    action: varchar("action", { length: 100 }).notNull(), // e.g. "event.created", "event.approved", "checkin.completed"
    entityType: varchar("entity_type", { length: 50 }).notNull(), // "event", "lead", "registration", "user"
    entityId: uuid("entity_id"), // ID of the affected entity
    description: text("description").notNull(), // Human-readable description
    metadata: text("metadata"), // JSON string for extra context
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("activity_log_actor_id_idx").on(table.actorId),
    index("activity_log_actor_id_created_at_idx").on(table.actorId, table.createdAt),
    index("activity_log_entity_type_entity_id_idx").on(table.entityType, table.entityId),
  ],
);

// ── Files ──────────────────────────────────────────────

export const files = pgTable(
  "files",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    ownerId: uuid("owner_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 500 }).notNull(),
    path: text("path").notNull(),
    mimeType: varchar("mime_type", { length: 255 }),
    size: integer("size"),
    folder: varchar("folder", { length: 500 }),
    isTemplate: boolean("is_template").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("files_owner_id_idx").on(table.ownerId),
    index("files_owner_id_created_at_idx").on(table.ownerId, table.createdAt),
  ],
);
