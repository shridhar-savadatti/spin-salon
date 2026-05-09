import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";

export function getSql() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not set");
  }
  return neon(process.env.DATABASE_URL);
}

export async function initDb() {
  const sql = getSql();

  await sql`
    CREATE TABLE IF NOT EXISTS staff (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      is_active SMALLINT NOT NULL DEFAULT 1
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS appointments (
      id TEXT PRIMARY KEY,
      customer_name TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      service_id TEXT NOT NULL,
      service_name TEXT NOT NULL,
      service_price DECIMAL NOT NULL,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      notes TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TEXT NOT NULL,
      staff_id TEXT,
      staff_name TEXT
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS time_slots (
      id TEXT PRIMARY KEY,
      time TEXT NOT NULL UNIQUE,
      is_active SMALLINT NOT NULL DEFAULT 1
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS blocked_slots (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      staff_id TEXT
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS admin_users (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'store'
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS analytics (
      id TEXT PRIMARY KEY,
      page TEXT NOT NULL,
      visited_at TEXT NOT NULL
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS campaigns (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      message_template TEXT NOT NULL,
      service_filter TEXT,
      weeks_since_visit INTEGER DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'draft',
      total_customers INTEGER DEFAULT 0,
      sent_count INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      sent_at TEXT
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS offers (
      id TEXT PRIMARY KEY,
      code TEXT NOT NULL UNIQUE,
      description TEXT,
      discount_type TEXT NOT NULL DEFAULT 'percentage',
      discount_value DECIMAL NOT NULL,
      min_order DECIMAL NOT NULL DEFAULT 0,
      valid_for TEXT NOT NULL DEFAULT 'all',
      category_filter TEXT,
      max_uses INTEGER,
      uses_count INTEGER NOT NULL DEFAULT 0,
      expires_at TEXT,
      is_active SMALLINT NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS blog_posts (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      excerpt TEXT,
      content TEXT NOT NULL,
      cover_image TEXT,
      published SMALLINT NOT NULL DEFAULT 0,
      published_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `;

  // Add discount columns to appointments if missing
  try {
    await sql`ALTER TABLE appointments ADD COLUMN IF NOT EXISTS discount_code TEXT`;
    await sql`ALTER TABLE appointments ADD COLUMN IF NOT EXISTS discount_amount DECIMAL DEFAULT 0`;
    await sql`ALTER TABLE appointments ADD COLUMN IF NOT EXISTS final_price DECIMAL`;
  } catch { /* columns already exist */ }

  // Only seed slots if missing — never bulk-delete at runtime (causes timeout)
  const slotCount = await sql`SELECT COUNT(*) as c FROM time_slots`;
  if (parseInt(slotCount[0].c as string) < 20) {
    const allSlots = [
      "08:30","09:00","09:30","10:00","10:30","11:00","11:30",
      "12:00","12:30","13:00","13:30","14:00","14:30",
      "15:00","15:30","16:00","16:30","17:00","17:30",
      "18:00","18:30","19:00","19:30","20:00","20:30","21:00",
    ];
    await sql`DELETE FROM time_slots`;
    for (let i = 0; i < allSlots.length; i++) {
      await sql`INSERT INTO time_slots (id, time, is_active) VALUES (${`slot-${i+1}`}, ${allSlots[i]}, 1)`;
    }
  }

  // Seed staff
  const staffCount = await sql`SELECT COUNT(*) as c FROM staff`;
  if (parseInt(staffCount[0].c as string) === 0) {
    const staffMembers = [
      { id: "staff-1", name: "Rakesh", role: "Hair Dresser" },
      { id: "staff-2", name: "Guru", role: "Hair Dresser" },
      { id: "staff-3", name: "Rajat", role: "Hair Dresser" },
      { id: "staff-4", name: "Reshma", role: "Beautician" },
      { id: "staff-5", name: "Purnima", role: "Beautician" },
      { id: "staff-6", name: "Amisha", role: "Beautician" },
    ];
    for (const s of staffMembers) {
      await sql`INSERT INTO staff (id, name, role) VALUES (${s.id}, ${s.name}, ${s.role}) ON CONFLICT DO NOTHING`;
    }
  }

  // Seed admin users
  const adminCount = await sql`SELECT COUNT(*) as c FROM admin_users`;
  if (parseInt(adminCount[0].c as string) === 0) {
    const storeHash = bcrypt.hashSync("admin123", 10);
    const blogHash = bcrypt.hashSync("blog123", 10);
    await sql`INSERT INTO admin_users (id, username, password_hash, role) VALUES ('admin-1', 'admin', ${storeHash}, 'store') ON CONFLICT DO NOTHING`;
    await sql`INSERT INTO admin_users (id, username, password_hash, role) VALUES ('admin-2', 'blogadmin', ${blogHash}, 'blog') ON CONFLICT DO NOTHING`;
  }
}
