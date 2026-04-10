ALTER TABLE "otp_codes" ADD COLUMN "code_hash" text;--> statement-breakpoint

CREATE UNIQUE INDEX "admin_scopes_admin_id_advisor_id_unique" ON "admin_scopes" USING btree ("admin_id","advisor_id");--> statement-breakpoint
CREATE INDEX "admin_scopes_advisor_id_idx" ON "admin_scopes" USING btree ("advisor_id");--> statement-breakpoint

CREATE INDEX "event_approval_log_event_id_idx" ON "event_approval_log" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "event_approval_log_event_id_created_at_idx" ON "event_approval_log" USING btree ("event_id","created_at");--> statement-breakpoint
CREATE INDEX "event_approval_log_actor_id_idx" ON "event_approval_log" USING btree ("actor_id");--> statement-breakpoint
CREATE INDEX "event_approval_log_actor_id_created_at_idx" ON "event_approval_log" USING btree ("actor_id","created_at");--> statement-breakpoint

CREATE UNIQUE INDEX "event_registrations_event_id_lead_id_unique" ON "event_registrations" USING btree ("event_id","lead_id");--> statement-breakpoint
CREATE INDEX "event_registrations_event_id_idx" ON "event_registrations" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "event_registrations_event_id_created_at_idx" ON "event_registrations" USING btree ("event_id","created_at");--> statement-breakpoint
CREATE INDEX "event_registrations_lead_id_idx" ON "event_registrations" USING btree ("lead_id");--> statement-breakpoint

CREATE INDEX "events_advisor_id_idx" ON "events" USING btree ("advisor_id");--> statement-breakpoint
CREATE INDEX "events_advisor_id_start_datetime_idx" ON "events" USING btree ("advisor_id","start_datetime");--> statement-breakpoint
CREATE INDEX "events_template_id_idx" ON "events" USING btree ("template_id");--> statement-breakpoint
CREATE INDEX "events_status_idx" ON "events" USING btree ("status");--> statement-breakpoint

CREATE INDEX "files_owner_id_idx" ON "files" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "files_owner_id_created_at_idx" ON "files" USING btree ("owner_id","created_at");--> statement-breakpoint

CREATE INDEX "leads_advisor_id_idx" ON "leads" USING btree ("advisor_id");--> statement-breakpoint
CREATE INDEX "leads_advisor_id_created_at_idx" ON "leads" USING btree ("advisor_id","created_at");--> statement-breakpoint
CREATE INDEX "leads_email_idx" ON "leads" USING btree ("email");--> statement-breakpoint

CREATE INDEX "otp_codes_email_idx" ON "otp_codes" USING btree ("email");--> statement-breakpoint
CREATE INDEX "otp_codes_email_code_idx" ON "otp_codes" USING btree ("email","code");--> statement-breakpoint
CREATE INDEX "otp_codes_email_code_hash_idx" ON "otp_codes" USING btree ("email","code_hash");--> statement-breakpoint
CREATE INDEX "otp_codes_email_expires_at_idx" ON "otp_codes" USING btree ("email","expires_at");--> statement-breakpoint

CREATE INDEX "sessions_profile_id_idx" ON "sessions" USING btree ("profile_id");--> statement-breakpoint
CREATE INDEX "sessions_profile_id_expires_at_idx" ON "sessions" USING btree ("profile_id","expires_at");--> statement-breakpoint
CREATE INDEX "sessions_expires_at_idx" ON "sessions" USING btree ("expires_at");
