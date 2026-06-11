import sharp from "sharp";
import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const W = 1080;
const H = 1080;

// SVG overlay: dark gradient + text
const svg = `
<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#000000" stop-opacity="0.25"/>
      <stop offset="55%" stop-color="#000000" stop-opacity="0.72"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0.88"/>
    </linearGradient>
  </defs>

  <!-- Full overlay -->
  <rect width="${W}" height="${H}" fill="url(#grad)"/>

  <!-- Top: logo area -->
  <text x="540" y="90" text-anchor="middle" font-family="Georgia, serif"
    font-size="28" fill="#ffffff" opacity="0.7" letter-spacing="6">SPIN UNISEX SALON</text>

  <!-- Divider line -->
  <line x1="200" y1="110" x2="880" y2="110" stroke="#ffffff" stroke-opacity="0.25" stroke-width="1"/>

  <!-- Limited offer tag -->
  <rect x="340" y="580" width="400" height="46" rx="23" fill="#22c55e" fill-opacity="0.9"/>
  <text x="540" y="611" text-anchor="middle" font-family="Arial, sans-serif"
    font-size="20" font-weight="bold" fill="#ffffff" letter-spacing="2">✦  LIMITED TIME OFFER  ✦</text>

  <!-- Main headline -->
  <text x="540" y="710" text-anchor="middle" font-family="Georgia, serif"
    font-size="72" font-weight="bold" fill="#ffffff">Permanent</text>
  <text x="540" y="795" text-anchor="middle" font-family="Georgia, serif"
    font-size="72" font-weight="bold" fill="#ffffff">Blowdry</text>

  <!-- Subtext -->
  <text x="540" y="855" text-anchor="middle" font-family="Arial, sans-serif"
    font-size="28" fill="#d4d4d8">For any hair length</text>

  <!-- Price -->
  <text x="540" y="930" text-anchor="middle" font-family="Georgia, serif"
    font-size="64" font-weight="bold" fill="#4ade80">₹4,999 only</text>

  <!-- Valid till -->
  <text x="540" y="978" text-anchor="middle" font-family="Arial, sans-serif"
    font-size="22" fill="#a1a1aa">Valid till June 3  ·  Kudlu Gate, Bengaluru</text>

  <!-- Bottom divider -->
  <line x1="200" y1="1004" x2="880" y2="1004" stroke="#ffffff" stroke-opacity="0.2" stroke-width="1"/>

  <!-- Website + phone -->
  <text x="540" y="1038" text-anchor="middle" font-family="Arial, sans-serif"
    font-size="20" fill="#a1a1aa" letter-spacing="1">spinkudlu.com  ·  +91 91643 63131</text>
</svg>
`;

const bgPath = path.join(root, "public/images/women-hair.jpg");
const outPath = path.join(root, "public/images/blowdry-offer-banner.jpg");

const bg = await sharp(bgPath)
  .resize(W, H, { fit: "cover", position: "top" })
  .toBuffer();

await sharp(bg)
  .composite([{ input: Buffer.from(svg), blend: "over" }])
  .jpeg({ quality: 92 })
  .toFile(outPath);

console.log("Banner saved to public/images/blowdry-offer-banner.jpg");
