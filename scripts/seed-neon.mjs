// Run: node scripts/seed-neon.mjs
import { neon } from "@neondatabase/serverless";

const DATABASE_URL = "postgresql://neondb_owner:npg_2NkDbiEg6QGq@ep-old-river-aogiv56o.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";
const sql = neon(DATABASE_URL);
const now = new Date().toISOString();

// ── Slots ──────────────────────────────────────
const slots = [
  "08:30","09:00","09:30","10:00","10:30","11:00","11:30",
  "12:00","12:30","13:00","13:30","14:00","14:30",
  "15:00","15:30","16:00","16:30","17:00","17:30",
  "18:00","18:30","19:00","19:30","20:00","20:30","21:00",
];
await sql`DELETE FROM time_slots`;
for (let i = 0; i < slots.length; i++) {
  await sql`INSERT INTO time_slots (id, time, is_active) VALUES (${`slot-${i+1}`}, ${slots[i]}, 1)`;
}
const sc = await sql`SELECT COUNT(*) as c FROM time_slots`;
console.log(`✓ Slots: ${sc[0].c} (08:30–21:00)`);

// ── Blog posts ─────────────────────────────────
const posts = [
  {
    id: "b1",
    title: "Balayage vs Highlights: Which is Right for You?",
    slug: "balayage-vs-highlights",
    excerpt: "Confused between balayage and highlights? Our colour specialists break down the differences, costs, and what suits your hair.",
    content: `# Balayage vs Highlights\n\nBalayage gives a natural, sun-kissed look while highlights give a more defined brightness.\n\n## What is Balayage?\n\nFreehand colour painted onto the hair. Low maintenance — touch up every 12-16 weeks. Perfect for a lived-in look. Starting from ₹3,400 at Spin Unisex Salon.\n\n## What are Highlights?\n\nApplied with foils for precise, structured colour. Brighter result. Touch up every 6-8 weeks. Starting from ₹4,000.\n\n## Which Should You Choose?\n\n**Choose balayage** if you want low-maintenance, natural dimension.\n**Choose highlights** if you want maximum brightness and a polished look.\n\nBook a free consultation at Spin Unisex Salon, Kudlu Gate, Bengaluru — near HSR Layout.`,
  },
  {
    id: "b2",
    title: "5 Signs Your Hair Needs a Keratin Treatment",
    slug: "signs-hair-needs-keratin",
    excerpt: "Frizzy, dry, brittle hair? Here are 5 signs your hair needs professional treatment at Spin Unisex Salon, Kudlu.",
    content: `# 5 Signs Your Hair Needs Treatment\n\n## Sign 1: Constant Frizz\n\nHumidity enters damaged hair causing frizz. A Nanoplastia (₹6,500) or Hair Botox (₹5,500) treatment fixes this for months.\n\n## Sign 2: Hair Breaks When Brushing\n\nStructurally weak hair needs a Deep Nourishing Hair Spa with Absolut Repair (₹2,000).\n\n## Sign 3: Dry Despite Oiling\n\nHighly porous hair loses moisture fast. SOS Botox Therapy fills gaps in the hair shaft.\n\n## Sign 4: Itchy Scalp\n\nOur Loreal Scalp Soothing Treatment (₹1,800) targets the root cause.\n\n## Sign 5: No Shine\n\nA regular Hair Spa (₹1,200) restores the cuticle and brings back shine.\n\nBook at Spin Unisex Salon, Kudlu Gate, Bengaluru — near HSR Layout.`,
  },
  {
    id: "b3",
    title: "Complete Pre-Bridal Routine: 3 Months to Your Wedding",
    slug: "pre-bridal-routine-3-months",
    excerpt: "Getting married? Your complete month-by-month bridal preparation guide from Spin Unisex Salon, Kudlu, Bengaluru.",
    content: `# Pre-Bridal Routine: 3 Months to Your Wedding\n\n## 3 Months Before\n\nStart with a Gold Moroccan Vitamin C Facial (₹2,800). Make major hair decisions — colour, keratin.\n\n## 2 Months Before\n\nPremium facials — Dead Sea Mineral (₹2,500) or Hydra Facial (₹5,000). Hair Spa and colour touch-up. Establish waxing routine.\n\n## 1 Month Before\n\nFacial peel. Trial hair styling session. Full body bleach and de-tan.\n\n## 1 Week Before\n\nLight clean-up. Final Hair Spa. Threading — leave 3-4 days before wedding.\n\n## Our Pre-Bride Package\n\n₹14,500 — Gold Moroccan Facial, wax, polish, manicure, pedicure, threading, haircut and spa.\n\nBook your consultation at Spin Unisex Salon, Kudlu Gate, Bengaluru.`,
  },
  {
    id: "b4",
    title: "Men's Grooming Tips for Bengaluru's Weather",
    slug: "mens-grooming-bengaluru",
    excerpt: "Bengaluru's humidity can ruin a good hairstyle. Expert grooming tips from Spin Unisex Salon, Kudlu — near HSR Layout.",
    content: `# Men's Grooming for Bengaluru's Climate\n\n## Hair in Humidity\n\nHumidity causes puffiness and loss of shape. Our Men's Hair Cut (₹250) and Advance Hair Cut (₹300) are cut for your texture.\n\nFor frizzy hair, Rebonding/Straightening (₹4,000) gives 6-8 months of smooth hair.\n\n## Beard Care\n\n- Wash beard 2-3 times a week\n- Oil once a week\n- Trim every 2-3 weeks — Beard Trim ₹150, Advance Beard ₹200\n\n## Scalp Health\n\nBengaluru's hard water causes dandruff. Our Dandruff Treatment and Hair Fall Treatment (₹1,300 each) target the root cause.\n\nVisit Spin Unisex Salon at Kudlu Main Road, near HSR Layout, Bengaluru.`,
  },
  {
    id: "b5",
    title: "Korean Glass Skin vs Hydra Facial: Which is Worth It?",
    slug: "korean-glass-skin-vs-hydra-facial",
    excerpt: "Korean Glass Skin (₹4,000) vs Hydra Facial (₹5,000) — what is the difference and which should you book at Spin Salon?",
    content: `# Korean Glass Skin vs Hydra Facial\n\n## Korean Glass Skin Facial — ₹4,000\n\nUses Korean Cica extract for intensive hydration and glow. Best for dry skin and dullness. No downtime.\n\n## Hydra Facial — ₹5,000\n\nMachine-based treatment combining cleansing, peel, and hydration. Best for clogged pores and blackheads. No downtime.\n\n## Which to Choose?\n\n**Korean Glass Skin** — if you want hydration and glow.\n\n**Hydra Facial** — if you have blackheads or uneven texture.\n\nFree skin assessment at Spin Unisex Salon, Kudlu Gate, Bengaluru — near HSR Layout.`,
  },
  {
    id: "b6",
    title: "How to Make Your Gel Nails Last Longer",
    slug: "gel-nails-last-longer",
    excerpt: "Tips from our nail artists at Spin Unisex Salon, Kudlu to make gel nails last 2-3 weeks without chipping.",
    content: `# How to Make Gel Nails Last Longer\n\n## Before You Leave the Salon\n\n- Cuticle area must be clean — gel on skin peels off\n- Tips should be capped (gel wrapped around edge)\n- Nails must feel smooth and hard after curing\n\n## First 24 Hours\n\n- Avoid long water exposure\n- No harsh cleaning products\n- Avoid high heat\n\n## Daily Habits\n\n- **Wear gloves** for cleaning\n- **Moisturise cuticles** daily\n- **Never pick** lifting edges\n\n## Services at Spin Unisex Salon\n\nGel Polish ₹900 | Gel Extensions from ₹3,200 | Nail Art from ₹500.\n\nBook at Spin Unisex Salon, Kudlu Gate, Bengaluru — near HSR Layout.`,
  },
];

await sql`DELETE FROM blog_posts`;
for (const p of posts) {
  await sql`INSERT INTO blog_posts (id, title, slug, excerpt, content, published, published_at, created_at, updated_at) VALUES (${p.id}, ${p.title}, ${p.slug}, ${p.excerpt}, ${p.content}, 1, ${now}, ${now}, ${now})`;
}
const bc = await sql`SELECT COUNT(*) as c FROM blog_posts WHERE published=1`;
console.log(`✓ Blog posts: ${bc[0].c}`);

console.log("✅ All done!");
