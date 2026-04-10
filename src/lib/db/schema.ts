import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  boolean,
  integer,
  pgEnum,
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
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ── Admin Scopes (scoped permissions for admin role) ───

export const adminScopes = pgTable("admin_scopes", {
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
});

// ── OTP Codes ──────────────────────────────────────────

export const otpCodes = pgTable("otp_codes", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email", { length: 255 }).notNull(),
  code: varchar("code", { length: 6 }).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  attempts: integer("attempts").default(0).notNull(),
  usedAt: timestamp("used_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ── Sessions ───────────────────────────────────────────

export const sessions = pgTable("sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  profileId: uuid("profile_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  token: varchar("token", { length: 255 }).notNull().unique(),
  userAgent: text("user_agent"),
  ipAddress: varchar("ip_address", { length: 45 }),
  expiresAt: timestamp("expires_at").notNull(),
  lastActiveAt: timestamp("last_active_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ── Leads ──────────────────────────────────────────────

export const leads = pgTable("leads", {
  id: uuid("id").defaultRandom().primaryKey(),
  advisorId: uuid("advisor_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  firstName: varchar("first_name", { length: 255 }).notNull(),
  lastName: varchar("last_name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ── Event Templates ────────────────────────────────────

export const eventTemplates = pgTable("event_templates", {
  id: uuid("id").defaultRandom().primaryKey(),
  templateName: varchar("template_name", { length: 255 }).notNull(),
  defaultTitle: varchar("default_title", { length: 255 }),
  defaultDuration: integer("default_duration"), // minutes
  defaultLocation: varchar("default_location", { length: 500 }),
  defaultNotes: text("default_notes"),
  defaultEventType: varchar("default_event_type", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ── Events ─────────────────────────────────────────────

export const events = pgTable("events", {
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
  startDatetime: timestamp("start_datetime").notNull(),
  endDatetime: timestamp("end_datetime").notNull(),
  timezone: varchar("timezone", { length: 100 }).default("America/New_York"),
  capacity: integer("capacity"),
  notes: text("notes"),
  repeatRule: varchar("repeat_rule", { length: 50 }), // weekly, monthly, null
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ── Event Registrations ────────────────────────────────

export const eventRegistrations = pgTable("event_registrations", {
  id: uuid("id").defaultRandom().primaryKey(),
  eventId: uuid("event_id")
    .notNull()
    .references(() => events.id, { onDelete: "cascade" }),
  leadId: uuid("lead_id")
    .notNull()
    .references(() => leads.id, { onDelete: "cascade" }),
  status: registrationStatusEnum("status").notNull().default("registered"),
  checkedInAt: timestamp("checked_in_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ── Event Approval Log ─────────────────────────────────

export const eventApprovalLog = pgTable("event_approval_log", {
  id: uuid("id").defaultRandom().primaryKey(),
  eventId: uuid("event_id")
    .notNull()
    .references(() => events.id, { onDelete: "cascade" }),
  action: approvalActionEnum("action").notNull(),
  actorId: uuid("actor_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ── Files ──────────────────────────────────────────────

export const files = pgTable("files", {
  id: uuid("id").defaultRandom().primaryKey(),
  ownerId: uuid("owner_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 500 }).notNull(),
  path: text("path").notNull(),
  mimeType: varchar("mime_type", { length: 255 }),
  size: integer("size"), // bytes
  folder: varchar("folder", { length: 500 }),
  isTemplate: boolean("is_template").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
