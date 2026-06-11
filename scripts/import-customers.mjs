// One-time script: imports customers from Excel into the customers table.
// Usage: node scripts/import-customers.mjs
import { readFileSync } from "fs";
import { neon } from "@neondatabase/serverless";
import { createRequire } from "module";
import { config } from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, "../.env.local") });

const require = createRequire(import.meta.url);
const XLSX = require("xlsx");

const sql = neon(process.env.DATABASE_URL);

// Create table if not exists
await sql`
  CREATE TABLE IF NOT EXISTS customers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL UNIQUE,
    last_visit TEXT,
    notes TEXT,
    source TEXT NOT NULL DEFAULT 'imported',
    created_at TEXT NOT NULL
  )
`;

const wb = XLSX.readFile(join(__dirname, "../_clients (2).xlsx"));
const ws = wb.Sheets[wb.SheetNames[0]];
const rows = XLSX.utils.sheet_to_json(ws);

console.log(`Total rows in Excel: ${rows.length}`);

let inserted = 0;
let skipped = 0;
let errors = 0;
const now = new Date().toISOString();
const today = now.split("T")[0];

for (const row of rows) {
  const name = String(row["Name"] || "").trim();
  const rawPhone = String(row["Contact"] || "").replace(/\D/g, "");
  const phone = rawPhone.length === 10 ? rawPhone : rawPhone.slice(-10);
  const notes = row["Notes"] ? String(row["Notes"]).trim() : null;

  // Parse last visit date
  let lastVisit = today;
  const rawLast = row["Last Visit"];
  if (rawLast && rawLast !== "NA") {
    if (typeof rawLast === "number") {
      // Excel serial date
      const d = XLSX.SSF.parse_date_code(rawLast);
      lastVisit = `${d.y}-${String(d.m).padStart(2,"0")}-${String(d.d).padStart(2,"0")}`;
    } else if (rawLast instanceof Date) {
      lastVisit = rawLast.toISOString().split("T")[0];
    } else if (typeof rawLast === "string" && rawLast.match(/\d{4}-\d{2}-\d{2}/)) {
      lastVisit = rawLast.split("T")[0];
    }
  }

  if (!name || phone.length !== 10) {
    skipped++;
    continue;
  }

  const id = `cust-${phone}`;

  try {
    await sql`
      INSERT INTO customers (id, name, phone, last_visit, notes, source, created_at)
      VALUES (${id}, ${name}, ${phone}, ${lastVisit}, ${notes}, 'imported', ${now})
      ON CONFLICT (phone) DO NOTHING
    `;
    inserted++;
    if (inserted % 200 === 0) console.log(`  Inserted ${inserted}...`);
  } catch (err) {
    errors++;
    console.error(`Error on ${name} / ${phone}:`, err.message);
  }
}

console.log(`\nDone. Inserted: ${inserted} | Skipped (bad data): ${skipped} | Errors: ${errors}`);
