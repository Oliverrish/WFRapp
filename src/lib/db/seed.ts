import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { config } from "dotenv";
import { randomBytes } from "crypto";
import * as schema from "./schema";

config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

// ── Helpers ────────────────────────────────────────────

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function futureDate(daysFromNow: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  d.setHours(randomFrom([9, 10, 11, 14, 15, 17, 18]), 0, 0, 0);
  return d;
}

function pastDate(daysAgo: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(randomFrom([9, 10, 11, 14, 15, 17, 18]), 0, 0, 0);
  return d;
}

function endTime(start: Date, durationMinutes: number): Date {
  return new Date(start.getTime() + durationMinutes * 60 * 1000);
}

// ── Data ───────────────────────────────────────────────

const firstNames = [
  "James", "Mary", "Robert", "Patricia", "John", "Jennifer", "Michael", "Linda",
  "David", "Elizabeth", "William", "Barbara", "Richard", "Susan", "Joseph", "Jessica",
  "Thomas", "Sarah", "Charles", "Karen", "Christopher", "Lisa", "Daniel", "Nancy",
  "Matthew", "Betty", "Anthony", "Margaret", "Mark", "Sandra", "Donald", "Ashley",
  "Steven", "Dorothy", "Paul", "Kimberly", "Andrew", "Emily", "Joshua", "Donna",
  "Kenneth", "Michelle", "Kevin", "Carol", "Brian", "Amanda", "George", "Melissa",
  "Timothy", "Deborah", "Ronald", "Stephanie", "Edward", "Rebecca", "Jason", "Sharon",
  "Jeffrey", "Laura", "Ryan", "Cynthia", "Jacob", "Kathleen", "Gary", "Amy",
  "Nicholas", "Angela", "Eric", "Shirley", "Jonathan", "Anna", "Stephen", "Brenda",
  "Larry", "Pamela", "Justin", "Emma", "Scott", "Nicole", "Brandon", "Helen",
  "Benjamin", "Samantha", "Samuel", "Katherine", "Raymond", "Christine", "Gregory", "Debra",
  "Frank", "Rachel", "Alexander", "Carolyn", "Patrick", "Janet", "Jack", "Catherine",
  "Dennis", "Maria", "Jerry", "Heather", "Tyler", "Diane", "Aaron", "Ruth",
];

const lastNames = [
  "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis",
  "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas",
  "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson", "White",
  "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson", "Walker", "Young",
  "Allen", "King", "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores",
  "Green", "Adams", "Nelson", "Baker", "Hall", "Rivera", "Campbell", "Mitchell",
  "Carter", "Roberts", "Gomez", "Phillips", "Evans", "Turner", "Diaz", "Parker",
  "Cruz", "Edwards", "Collins", "Reyes", "Stewart", "Morris", "Morales", "Murphy",
  "Cook", "Rogers", "Gutierrez", "Ortiz", "Morgan", "Cooper", "Peterson", "Bailey",
  "Reed", "Kelly", "Howard", "Ramos", "Kim", "Cox", "Ward", "Richardson",
];

const venues = [
  { name: "Scotch & Sirloin Restaurant", address: "1800 E Oakland Park Blvd, Fort Lauderdale, FL 33306" },
  { name: "The Capital Grille", address: "4520 PGA Blvd, Palm Beach Gardens, FL 33418" },
  { name: "Ruth's Chris Steak House", address: "661 US-1, North Palm Beach, FL 33408" },
  { name: "Morton's The Steakhouse", address: "777 S Flagler Dr, West Palm Beach, FL 33401" },
  { name: "Seasons 52", address: "2300 NW Executive Center Dr, Boca Raton, FL 33431" },
  { name: "The Breakers Hotel", address: "1 S County Rd, Palm Beach, FL 33480" },
  { name: "PGA National Resort", address: "400 Ave of the Champions, Palm Beach Gardens, FL 33418" },
  { name: "Eau Palm Beach Resort", address: "100 S Ocean Blvd, Manalapan, FL 33462" },
  { name: "Four Seasons Palm Beach", address: "2800 S Ocean Blvd, Palm Beach, FL 33480" },
  { name: "Hilton West Palm Beach", address: "600 Okeechobee Blvd, West Palm Beach, FL 33401" },
  { name: "Marriott Singer Island", address: "3800 N Ocean Dr, Riviera Beach, FL 33404" },
  { name: "The Colony Hotel", address: "155 Hammon Ave, Palm Beach, FL 33480" },
  { name: "Boca Raton Resort", address: "501 E Camino Real, Boca Raton, FL 33432" },
  { name: "Jupiter Beach Resort", address: "5 N A1A, Jupiter, FL 33477" },
  { name: "Delray Beach Marriott", address: "10 N Ocean Blvd, Delray Beach, FL 33483" },
];

const workshopTitles = [
  "Retirement Income Strategies Workshop",
  "Social Security Optimization Seminar",
  "Tax-Efficient Retirement Planning",
  "Estate Planning Essentials",
  "Medicare & Healthcare in Retirement",
  "Investment Strategies for Retirees",
  "Retirement Lifestyle Planning Workshop",
  "Protecting Your Retirement Assets",
  "Women & Retirement: Financial Independence",
  "Pre-Retirement Readiness Workshop",
];

// ── Seed Functions ─────────────────────────────────────

async function seed() {
  console.log("🌱 Starting seed...\n");

  // Clear existing data (in reverse FK order)
  console.log("  Clearing existing data...");
  await db.delete(schema.eventApprovalLog);
  await db.delete(schema.eventRegistrations);
  await db.delete(schema.events);
  await db.delete(schema.eventTemplates);
  await db.delete(schema.leads);
  await db.delete(schema.adminScopes);
  await db.delete(schema.sessions);
  await db.delete(schema.otpCodes);
  await db.delete(schema.files);
  await db.delete(schema.profiles);

  // ── 1. Profiles ────────────────────────────────────

  console.log("  Creating profiles...");
  const [superAdmin] = await db
    .insert(schema.profiles)
    .values({
      email: "oliver@wfr.com",
      fullName: "Oliver Rose",
      phone: "(561) 555-0100",
      role: "super_admin",
    })
    .returning();

  const [admin] = await db
    .insert(schema.profiles)
    .values({
      email: "sarah@wfr.com",
      fullName: "Sarah Mitchell",
      phone: "(561) 555-0200",
      role: "admin",
    })
    .returning();

  const [advisor1] = await db
    .insert(schema.profiles)
    .values({
      email: "demo@wfr.com",
      fullName: "Demo Advisor",
      phone: "(561) 555-0300",
      role: "advisor",
    })
    .returning();

  const [advisor2] = await db
    .insert(schema.profiles)
    .values({
      email: "john.carter@wfr.com",
      fullName: "John Carter",
      phone: "(561) 555-0400",
      role: "advisor",
    })
    .returning();

  const [advisor3] = await db
    .insert(schema.profiles)
    .values({
      email: "maria.gonzalez@wfr.com",
      fullName: "Maria Gonzalez",
      phone: "(561) 555-0500",
      role: "advisor",
    })
    .returning();

  const advisors = [advisor1, advisor2, advisor3];
  console.log(`  ✓ 5 profiles created (1 super_admin, 1 admin, 3 advisors)`);

  // ── 2. Admin Scopes ────────────────────────────────

  console.log("  Creating admin scopes...");
  for (const advisor of advisors) {
    await db.insert(schema.adminScopes).values({
      adminId: admin.id,
      advisorId: advisor.id,
      canEditEvents: true,
      canViewLeads: true,
      canManageTemplates: true,
      canViewReports: true,
    });
  }
  console.log(`  ✓ ${advisors.length} admin scopes created`);

  // ── 3. Event Templates ─────────────────────────────

  console.log("  Creating event templates...");
  const templateData = [
    { templateName: "Retirement Income Workshop", defaultTitle: "Retirement Income Strategies Workshop", defaultDuration: 90, defaultLocation: "TBD", defaultEventType: "workshop" },
    { templateName: "Social Security Seminar", defaultTitle: "Social Security Optimization Seminar", defaultDuration: 60, defaultLocation: "TBD", defaultEventType: "seminar" },
    { templateName: "Tax Planning Workshop", defaultTitle: "Tax-Efficient Retirement Planning", defaultDuration: 90, defaultLocation: "TBD", defaultEventType: "workshop" },
    { templateName: "Estate Planning Dinner", defaultTitle: "Estate Planning Essentials", defaultDuration: 120, defaultLocation: "TBD", defaultNotes: "Dinner included. Confirm dietary restrictions.", defaultEventType: "dinner" },
    { templateName: "Medicare Seminar", defaultTitle: "Medicare & Healthcare in Retirement", defaultDuration: 75, defaultLocation: "TBD", defaultEventType: "seminar" },
  ];

  const templates = await db
    .insert(schema.eventTemplates)
    .values(templateData)
    .returning();
  console.log(`  ✓ ${templates.length} event templates created`);

  // ── 4. Events ──────────────────────────────────────

  console.log("  Creating events...");
  type EventStatus = "draft" | "pending_approval" | "scheduled" | "live" | "completed" | "cancelled";
  const eventValues: Array<{
    advisorId: string;
    templateId: string;
    title: string;
    description: string;
    status: EventStatus;
    locationName: string;
    locationAddress: string;
    startDatetime: Date;
    endDatetime: Date;
    timezone: string;
    capacity: number;
    notes: string | null;
  }> = [];

  // 8 completed events (past)
  for (let i = 0; i < 8; i++) {
    const advisor = randomFrom(advisors);
    const venue = randomFrom(venues);
    const start = pastDate(randomBetween(5, 60));
    eventValues.push({
      advisorId: advisor.id,
      templateId: randomFrom(templates).id,
      title: randomFrom(workshopTitles),
      description: "Join us for an informative session on retirement planning strategies.",
      status: "completed",
      locationName: venue.name,
      locationAddress: venue.address,
      startDatetime: start,
      endDatetime: endTime(start, randomFrom([60, 75, 90, 120])),
      timezone: "America/New_York",
      capacity: randomBetween(10, 30),
      notes: i % 3 === 0 ? "Great turnout. Follow up with attendees." : null,
    });
  }

  // 2 live events (today)
  for (let i = 0; i < 2; i++) {
    const advisor = advisors[i];
    const venue = randomFrom(venues);
    const start = new Date();
    start.setHours(18, 0, 0, 0);
    eventValues.push({
      advisorId: advisor.id,
      templateId: randomFrom(templates).id,
      title: randomFrom(workshopTitles),
      description: "Currently in progress. Check-in attendees as they arrive.",
      status: "live",
      locationName: venue.name,
      locationAddress: venue.address,
      startDatetime: start,
      endDatetime: endTime(start, 90),
      timezone: "America/New_York",
      capacity: randomBetween(12, 25),
      notes: "Event is live!",
    });
  }

  // 10 scheduled events (upcoming)
  for (let i = 0; i < 10; i++) {
    const advisor = randomFrom(advisors);
    const venue = randomFrom(venues);
    const start = futureDate(randomBetween(1, 45));
    eventValues.push({
      advisorId: advisor.id,
      templateId: randomFrom(templates).id,
      title: randomFrom(workshopTitles),
      description: "An upcoming workshop for pre-retirees and retirees looking to optimize their financial plans.",
      status: "scheduled",
      locationName: venue.name,
      locationAddress: venue.address,
      startDatetime: start,
      endDatetime: endTime(start, randomFrom([60, 75, 90, 120])),
      timezone: "America/New_York",
      capacity: randomBetween(10, 30),
      notes: null,
    });
  }

  // 4 pending_approval events
  for (let i = 0; i < 4; i++) {
    const advisor = randomFrom(advisors);
    const venue = randomFrom(venues);
    const start = futureDate(randomBetween(14, 60));
    eventValues.push({
      advisorId: advisor.id,
      templateId: randomFrom(templates).id,
      title: randomFrom(workshopTitles),
      description: "Awaiting admin approval before scheduling.",
      status: "pending_approval",
      locationName: venue.name,
      locationAddress: venue.address,
      startDatetime: start,
      endDatetime: endTime(start, randomFrom([60, 90])),
      timezone: "America/New_York",
      capacity: randomBetween(15, 25),
      notes: null,
    });
  }

  // 4 draft events
  for (let i = 0; i < 4; i++) {
    const advisor = randomFrom(advisors);
    const venue = randomFrom(venues);
    const start = futureDate(randomBetween(20, 90));
    eventValues.push({
      advisorId: advisor.id,
      templateId: null as unknown as string,
      title: randomFrom(workshopTitles),
      description: "",
      status: "draft",
      locationName: i % 2 === 0 ? venue.name : "",
      locationAddress: i % 2 === 0 ? venue.address : "",
      startDatetime: start,
      endDatetime: endTime(start, 90),
      timezone: "America/New_York",
      capacity: 20,
      notes: "Still working on details...",
    });
  }

  // 2 cancelled events
  for (let i = 0; i < 2; i++) {
    const advisor = randomFrom(advisors);
    const venue = randomFrom(venues);
    const start = futureDate(randomBetween(5, 30));
    eventValues.push({
      advisorId: advisor.id,
      templateId: randomFrom(templates).id,
      title: randomFrom(workshopTitles),
      description: "This event has been cancelled.",
      status: "cancelled",
      locationName: venue.name,
      locationAddress: venue.address,
      startDatetime: start,
      endDatetime: endTime(start, 90),
      timezone: "America/New_York",
      capacity: 20,
      notes: "Cancelled due to venue conflict.",
    });
  }

  const allEvents = await db
    .insert(schema.events)
    .values(eventValues)
    .returning();
  console.log(`  ✓ ${allEvents.length} events created (8 completed, 2 live, 10 scheduled, 4 pending, 4 draft, 2 cancelled)`);

  // ── 5. Leads ───────────────────────────────────────

  console.log("  Creating 200 leads...");
  const leadValues = [];
  const usedEmails = new Set<string>();

  for (let i = 0; i < 200; i++) {
    const fn = randomFrom(firstNames);
    const ln = randomFrom(lastNames);
    let email = `${fn.toLowerCase()}.${ln.toLowerCase()}@gmail.com`;
    // Ensure unique emails
    let suffix = 1;
    while (usedEmails.has(email)) {
      email = `${fn.toLowerCase()}.${ln.toLowerCase()}${suffix}@gmail.com`;
      suffix++;
    }
    usedEmails.add(email);

    leadValues.push({
      advisorId: randomFrom(advisors).id,
      firstName: fn,
      lastName: ln,
      email,
      phone: `(${randomBetween(200, 999)}) ${randomBetween(200, 999)}-${String(randomBetween(1000, 9999))}`,
    });
  }

  const allLeads = await db
    .insert(schema.leads)
    .values(leadValues)
    .returning();
  console.log(`  ✓ ${allLeads.length} leads created`);

  // ── 6. Event Registrations ─────────────────────────

  console.log("  Creating event registrations...");
  type RegStatus = "registered" | "checked_in" | "no_show";
  const regValues: Array<{
    eventId: string;
    leadId: string;
    status: RegStatus;
    checkedInAt: Date | null;
  }> = [];

  for (const event of allEvents) {
    if (event.status === "draft") continue;

    // Get leads for this advisor
    const advisorLeads = allLeads.filter((l) => l.advisorId === event.advisorId);
    const numRegistrations = Math.min(
      randomBetween(4, 15),
      advisorLeads.length
    );

    // Shuffle and pick
    const shuffled = [...advisorLeads].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, numRegistrations);

    for (const lead of selected) {
      let status: RegStatus = "registered";
      let checkedInAt: Date | null = null;

      if (event.status === "completed") {
        const roll = Math.random();
        if (roll < 0.65) {
          status = "checked_in";
          checkedInAt = new Date(event.startDatetime.getTime() + randomBetween(0, 15) * 60 * 1000);
        } else if (roll < 0.9) {
          status = "no_show";
        }
      } else if (event.status === "live") {
        const roll = Math.random();
        if (roll < 0.5) {
          status = "checked_in";
          checkedInAt = new Date();
        }
      }

      regValues.push({
        eventId: event.id,
        leadId: lead.id,
        status,
        checkedInAt,
      });
    }
  }

  const allRegs = await db
    .insert(schema.eventRegistrations)
    .values(regValues)
    .returning();
  console.log(`  ✓ ${allRegs.length} event registrations created`);

  // ── 7. Approval Log ────────────────────────────────

  console.log("  Creating approval log entries...");
  const approvalValues = [];

  for (const event of allEvents) {
    if (["scheduled", "completed", "live"].includes(event.status)) {
      // These went through approval
      approvalValues.push({
        eventId: event.id,
        action: "submitted" as const,
        actorId: event.advisorId,
        comment: null,
      });
      approvalValues.push({
        eventId: event.id,
        action: "approved" as const,
        actorId: randomFrom([superAdmin.id, admin.id]),
        comment: "Looks good, approved!",
      });
    } else if (event.status === "pending_approval") {
      approvalValues.push({
        eventId: event.id,
        action: "submitted" as const,
        actorId: event.advisorId,
        comment: null,
      });
    } else if (event.status === "cancelled") {
      approvalValues.push({
        eventId: event.id,
        action: "submitted" as const,
        actorId: event.advisorId,
        comment: null,
      });
      approvalValues.push({
        eventId: event.id,
        action: "approved" as const,
        actorId: admin.id,
        comment: "Approved",
      });
    }
  }

  if (approvalValues.length > 0) {
    await db.insert(schema.eventApprovalLog).values(approvalValues);
  }
  console.log(`  ✓ ${approvalValues.length} approval log entries created`);

  // ── Summary ────────────────────────────────────────

  console.log("\n✅ Seed complete!\n");
  console.log("  Login credentials:");
  console.log("  ─────────────────────────────────────────");
  console.log("  Super Admin: oliver@wfr.com  (code: 111111)");
  console.log("  Admin:       sarah@wfr.com   (code: 111111)");
  console.log("  Advisor:     demo@wfr.com    (code: 111111)");
  console.log("  Advisor:     john.carter@wfr.com");
  console.log("  Advisor:     maria.gonzalez@wfr.com");
  console.log("  ─────────────────────────────────────────");
  console.log(`\n  Admin dashboard: /admin/dashboard`);
  console.log(`  Super admin:     /super-admin/users\n`);
}

seed().catch((e) => {
  console.error("❌ Seed failed:", e);
  process.exit(1);
});
