const Database = require("better-sqlite3");
const path = require("path");

const db = new Database(path.join(__dirname, "../data/salon.db"));
const now = new Date().toISOString();

function slug(title) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

const posts = [
  {
    title: "Balayage vs Highlights: Which Hair Colouring Technique is Right for You?",
    excerpt: "Confused between balayage and highlights? Our colour specialists at Spin Unisex Salon, Kudlu break down the key differences, costs, and what suits your hair type.",
    content: `# Balayage vs Highlights: Which One Should You Choose?

If you have ever walked into a salon and felt overwhelmed by the menu of hair colouring options, you are not alone. Balayage and highlights are two of the most popular techniques — but they look and feel very different on your hair.

At Spin Unisex Salon in Kudlu, Bengaluru, our colour specialists work with both techniques every day. Here is everything you need to know before your next appointment.

## What Are Highlights?

Highlights are sections of hair that are lightened using foils. The foil separates each section from the rest of your hair, allowing the colourist to apply bleach or colour precisely.

**Best for:**
- A more defined, structured look
- Adding brightness around the face
- People who want a consistent, even result
- Those with darker base colours who need strong lift

Highlights at Spin Unisex Salon start from ₹4,000* for women and ₹1,350* for men.

## What Is Balayage?

Balayage is a French technique where colour is painted freehand directly onto the hair. The word itself means "to sweep" in French. The result is a soft, sun-kissed, natural-looking grow-out.

**Best for:**
- A natural, lived-in look
- Low-maintenance colour (fewer salon visits)
- All hair types and textures
- People who want dimension without harsh lines

## Key Differences at a Glance

**Maintenance:** Highlights typically need touch-ups every 6–8 weeks. Balayage can go 12–16 weeks between visits, making it a more economical choice in the long run.

**Look:** Highlights give a more uniform, bright effect. Balayage looks more natural and blended.

**Damage:** Because balayage is painted on the mid-lengths and ends rather than the root, it is generally gentler on the hair.

**Cost:** Balayage is often priced higher per session but cheaper annually due to fewer visits.

## Which One is Right for You?

Choose **highlights** if you want maximum brightness and a structured, polished look. Choose **balayage** if you want low-maintenance, natural dimension.

Not sure? Book a free consultation with our colour team at Spin Unisex Salon, Kudlu Gate, Bengaluru. We will assess your hair texture, face shape, and lifestyle before recommending the right technique for you.

## Book Your Colour Appointment Today

Walk into Spin Unisex Salon at Kudlu Main Road, near HSR Layout, or book online. Our experienced colour specialists will help you achieve the look you want within your budget.`,
  },
  {
    title: "5 Signs Your Hair is Crying Out for a Keratin or Spa Treatment",
    excerpt: "Frizzy, dry, brittle hair? Here are 5 clear signs your hair needs professional treatment — and what the right treatment can do for you at Spin Unisex Salon, Kudlu.",
    content: `# 5 Signs Your Hair Needs a Professional Treatment

Bengaluru's weather — the humidity, the dust, the hard water — takes a serious toll on hair. If you have been fighting frizz, breakage, or dullness every morning, your hair might be sending you distress signals.

At Spin Unisex Salon, Kudlu, we see these signs every day. Here is how to read them.

## Sign 1: Your Hair is Constantly Frizzy

Frizz happens when the outer layer of your hair (the cuticle) is raised and rough. Humidity enters the hair shaft and causes it to swell unevenly.

**The fix:** A Keratin Treatment or Hair Botox smooths the cuticle and seals moisture inside. Results last 3–5 months.

Our Nanoplastia treatment (₹6,500* for women, ₹4,000* for men) is an ammonia-free amino acid restoration that provides frizz-free smoothness for months.

## Sign 2: Your Hair Breaks When You Brush It

If your hairbrush collects a disturbing amount of broken strands, your hair is structurally weak. This is often caused by over-colouring, heat damage, or nutritional deficiency.

**The fix:** A Deep Nourishing Hair Spa with Absolut Repair (₹2,000* for women) rebuilds the internal bond of each strand, dramatically reducing breakage.

## Sign 3: Your Hair Feels Dry No Matter How Much You Oil It

If your hair absorbs oil but still feels dry an hour later, it is highly porous — meaning it loses moisture as fast as it gains it.

**The fix:** SOS Macadamia Botox Therapy fills the gaps in the hair shaft with proteins and lipids, restoring moisture retention.

## Sign 4: Your Scalp is Itchy or Flaky

An itchy, flaky scalp is not always dandruff — it can be product buildup, dryness, or scalp sensitivity. Bengaluru's hard water makes this significantly worse.

**The fix:** Our Loreal Scalp Soothing Treatment (₹1,800*) or Brillare Dandruff Treatment (₹1,800*) targets the root cause rather than masking symptoms.

## Sign 5: Your Hair Has Lost Its Shine

Healthy hair reflects light. Dull hair is damaged at the cuticle level. A regular Hair Spa (₹1,200*) restores the surface of the hair and brings the shine back.

## When Should You Come In?

Ideally, get a professional hair treatment every 4–6 weeks. If your hair shows two or more of the signs above, book an appointment at Spin Unisex Salon, Kudlu Gate (near HSR Layout) as soon as possible. Our hair specialists will recommend the right treatment with honest advice.`,
  },
  {
    title: "Complete Pre-Bridal Skin and Hair Routine: A 3-Month Wedding Countdown",
    excerpt: "Getting married? Here is your complete month-by-month bridal skin and hair preparation guide from the experts at Spin Unisex Salon, Kudlu, Bengaluru.",
    content: `# The Complete Pre-Bridal Routine: 3 Months to Your Wedding Day

Your wedding is one of the most photographed days of your life. Getting your skin and hair ready is not something you do the week before — it is a 3-month process.

At Spin Unisex Salon, Kudlu, we have prepared hundreds of brides for their big day. Here is the exact timeline we recommend.

## 3 Months Before the Wedding

**Skin:** Start with a deep skin consultation. For most brides, we recommend beginning with a Gold Moroccan Vitamin C Facial (₹2,800*) to brighten and even the skin tone.

**Hair:** Now is the time to make any major hair decisions — colour, keratin, length. Any treatment with a long grow-out period should be done at 3 months so it looks natural by the wedding.

**Nails:** Get your nails assessed. Start a regular manicure routine to strengthen them before gel extensions.

## 2 Months Before the Wedding

**Skin:** Address specific concerns — pigmentation, dullness, open pores. Our Premium Facials — Dead Sea Mineral (₹2,500*), Korean Glass Skin (₹4,000*), or Hydra Facial (₹5,000*) — work brilliantly in this phase.

**Hair:** Book your Hair Spa (₹1,200*) and any colour refresh. If you are having highlights, do a touch-up now.

**Waxing:** Establish a waxing routine so your skin is accustomed to it before the wedding.

## 1 Month Before the Wedding

**Skin:** Consider a facial peel — Oil Away, Brightening, or Ace Revival (₹2,800–3,000*). Allow at least 2 weeks for skin to settle after a peel.

**Hair:** Book your trial hair styling session. This is when you finalise your bridal look with our stylists.

**Bleach and De-Tan:** Do a full body bleach and de-tan now for even, radiant skin on the wedding day.

## 1 Week Before the Wedding

**Skin:** A light, hydrating clean-up. Nothing aggressive — your skin needs to be calm and glowing.

**Hair:** Final conditioning Hair Spa.

**Threading:** Shape eyebrows. Leave at least 3–4 days before the wedding for redness to settle.

## Wedding Day

Our Pre-Bride Package (₹14,500*) covers everything in one session: Gold Moroccan Vitamin C Facial, Face Bleach/Tan Pack, Full Body Waxing, Full Body Polishing, Chocolate Manicure, Chocolate Pedicure, Organic Clean Up, Full Face Threading, Hair Cut, and Hair Spa.

Bridal Makeup is available from ₹10,000* and Trial Makeup from ₹2,000*.

## Book Your Pre-Bridal Consultation

Contact Spin Unisex Salon at Kudlu Main Road, near HSR Layout, Bengaluru. We offer complimentary bridal consultations and can put together a personalised package for your timeline and budget.`,
  },
  {
    title: "The Best Men's Grooming Habits for Bengaluru's Weather",
    excerpt: "Bengaluru's weather is unpredictable — humid mornings, dusty afternoons, cold evenings. Here are the grooming habits every man in the city needs, from Spin Unisex Salon, Kudlu.",
    content: `# Men's Grooming for Bengaluru's Climate: A Complete Guide

Bengaluru's weather is unique — not quite tropical, not quite dry. The humidity in areas like Kudlu, HSR Layout, and Silk Board can wreck an unprotected haircut within hours. Here is how to stay sharp all year.

## Your Hair in Bengaluru's Humidity

Humidity is the enemy of a good hairstyle. It causes hair to absorb moisture from the air, leading to puffiness, frizz, and loss of shape.

**The solution:** A good haircut is the foundation. At Spin Unisex Salon, our men's cuts start at ₹250* and our stylists cut for your hair texture — not just your reference photo.

For men with naturally frizzy or thick hair, a Rebonding or Straightening treatment (₹4,000*) gives 6–8 months of smooth, manageable hair.

## Beard Care in the City

Bengaluru's pollution and dust settle in facial hair surprisingly fast. A beard that is not maintained becomes a trap for grime.

**Weekly routine:**
- Wash beard 2–3 times a week with a mild shampoo
- Oil once a week (our Almond Oil Head Massage at ₹400* includes the beard and scalp)
- Trim every 2–3 weeks to maintain shape

Our Beard Trim (₹150*) and Beard Styling (₹200*) services keep your beard sharp between home care.

## Scalp Health: The Ignored Foundation

Most men focus on hair but ignore the scalp. Bengaluru's hard water causes dandruff, itchiness, and hair fall — especially in areas like Kudlu and Electronic City where water quality varies.

**Signs you need a scalp treatment:**
- Visible flaking on the collar
- Constant itchiness
- More hair than usual on your pillow

Our Dandruff Treatment and Hair Fall Treatment (₹1,300* each) target the root cause with Brillare professional formulas.

## The Monthly Visit: What to Book

For a well-maintained look:
- Hair Cut every 3–4 weeks (₹250*)
- Beard Trim every 2 weeks (₹150*)
- Hair Spa once a month (₹850*)
- Scalp treatment every 6–8 weeks if needed

## Walk In or Book Online

We are at Kudlu Main Road, Kudlu Gate — 5 minutes from HSR Layout. No appointment needed for cuts and trims, but we recommend booking for spa and colour treatments.`,
  },
  {
    title: "Korean Glass Skin vs Hydra Facial: Which Premium Facial is Worth It?",
    excerpt: "Two of the most talked-about premium facials — Korean Glass Skin and Hydra Facial. What is the difference and which one should you book at Spin Unisex Salon, Kudlu?",
    content: `# Korean Glass Skin vs Hydra Facial: An Honest Comparison

Premium facials have gone far beyond the standard clean-up. Two treatments our clients ask about most at Spin Unisex Salon, Kudlu are the Korean Glass Skin Facial and the Hydra Facial. Both promise luminous, clear skin — but they work very differently.

## What is the Korean Glass Skin Facial?

Korean glass skin refers to skin so hydrated and clear it has a mirror-like, translucent appearance. Our Korean Glass Skin Facial (₹4,000*) uses Korean Cica extract for intensive hydration and glow.

**How it works:** Korean Cica (Centella Asiatica) is a plant extract with powerful skin-renewing properties. The treatment provides:
- Deep hydration that plumps the skin
- Tightening of pores for smoother texture
- Calming of redness and irritation
- A natural, lit-from-within glow

**Best for:** All skin types except active acne. Particularly good for dry skin, early signs of ageing, or dull, tired-looking skin.

**Downtime:** None. You can return to work immediately.

## What is a Hydra Facial?

The Hydra Facial (₹5,000*) is a machine-based treatment combining cleansing, a gentle acid peel, and infusion of hyaluronic acid and antioxidants in one session.

**How it works:** A specialised handpiece:
- Removes dead skin cells and clears clogged pores
- Applies a mild peel to loosen debris
- Vacuums out blackheads and impurities
- Infuses deeply hydrating serums into the skin

**Best for:** Congested skin, large pores, blackheads, uneven texture, and early pigmentation.

**Downtime:** None. Some clients notice a slight flush for 1–2 hours.

## Which One Should You Choose?

Choose Korean Glass Skin if your main concern is hydration and glow. Choose Hydra Facial if your skin has blackheads, open pores, or uneven texture.

Not sure? Our skin specialists at Spin Unisex Salon, Kudlu offer a free skin assessment before every facial. We recommend the right treatment based on your actual skin condition.

## Book Your Facial Near HSR Layout

Visit us at Kudlu Main Road, Kudlu Gate, Bengaluru — just minutes from HSR Layout, Bommanahalli, and Silk Board. Both facials are available on weekdays and weekends.`,
  },
  {
    title: "How to Make Your Gel Nails Last Longer: Tips From Our Nail Artists",
    excerpt: "Getting gel nails done and watching them chip within a week is frustrating. Here are the professional tips our nail artists at Spin Unisex Salon, Kudlu share with every client.",
    content: `# How to Make Your Gel Nails Last Longer

Gel nails should last 2–3 weeks without chipping. If yours are not, something in the application or aftercare is off. Our nail artists at Spin Unisex Salon, Kudlu share the tips they give every client after every appointment.

## Why Gel Nails Chip Too Soon

Premature chipping is almost always caused by one of three things:
- Poor preparation of the nail bed before application
- Incorrect curing under the UV or LED lamp
- Aftercare mistakes at home

At Spin Unisex Salon, we use professional-grade gel polishes and ensure correct curing time — which dramatically extends wear. Our Gel Polish application (₹900* fixed price) includes full prep and finish.

## Before You Leave the Salon: What to Check

**Cuticle cleaning:** Any gel left on the skin around the nail will peel off and take the nail with it. Make sure the cuticle area is completely clean.

**Cap the edges:** The gel should wrap around the tip of each nail. This seals the edge and prevents water from lifting the gel from underneath.

**The dry test:** After curing, run your fingernail across each nail. It should feel completely smooth and hard with no tacky residue.

## At-Home Aftercare: The First 24 Hours

For the first 24 hours after your appointment:
- Avoid long exposure to water (no long baths or swimming)
- Do not use harsh cleaning products without gloves
- Avoid high heat — saunas and very hot dishes

## Daily Habits That Protect Gel Nails

**Wear gloves for cleaning:** Household cleaners and detergents break down the gel bond. This single habit will double the life of your nails.

**Moisturise your cuticles daily:** Dry cuticles pull away from the nail, creating a gap where moisture enters. Apply cuticle oil or hand cream daily.

**Do not use your nails as tools:** Opening cans, scraping stickers, and prying things break gel nails faster than anything else.

**Avoid picking:** If a nail starts to lift at the edge, do not pick it. Come back to us for a repair — picking strips the top layer of your natural nail.

## When to Come Back

Gel nails should be removed and reapplied every 2–3 weeks. Leaving them longer weakens the natural nail underneath.

Our Removal of Extension service (₹500* fixed price) ensures a clean removal without damage to the natural nail.

## Our Full Nail Menu at Spin Unisex Salon, Kudlu

From a basic Nail Cut and File (₹150*) to Gel Extensions (₹3,200*) and creative Nail Art (₹500* onwards), our nail artists work with both gel and acrylic systems.

Book your nail appointment at Kudlu Main Road, near HSR Layout, Bengaluru.`,
  },
];

const insert = db.prepare(`
  INSERT OR IGNORE INTO blog_posts (id, title, slug, excerpt, content, published, published_at, created_at, updated_at)
  VALUES (?, ?, ?, ?, ?, 1, ?, ?, ?)
`);

let count = 0;
for (let i = 0; i < posts.length; i++) {
  const post = posts[i];
  const id = `blog-seed-${i + 1}`;
  const s = slug(post.title);
  try {
    insert.run(id, post.title, s, post.excerpt, post.content, now, now, now);
    console.log(`✓ ${s}`);
    count++;
  } catch (e) {
    console.error(`✗ ${post.title}:`, e.message);
  }
}

console.log(`\nDone. ${count} blog posts created.`);
