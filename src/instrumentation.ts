export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const url = process.env.DATABASE_URL;
    if (!url || url.includes("REPLACE_WITH")) {
      console.warn("⚠️  DATABASE_URL not set — skipping DB init. Add your Neon URL to .env.local");
      return;
    }
    const { initDb } = await import("./lib/db");
    await initDb();
  }
}
