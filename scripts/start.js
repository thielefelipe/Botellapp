/**
 * BOTELLAPP - Production Start Script
 * Handles database initialization before starting Next.js
 */
const { execSync } = require("child_process");

async function start() {
  console.log("🚀 BOTELLAPP starting...");
  console.log("📅 " + new Date().toISOString());

  // Run database migrations/push
  try {
    console.log("📦 Setting up database...");
    execSync("npx prisma db push --skip-generate", {
      stdio: "inherit",
      env: process.env,
    });
    console.log("✅ Database schema ready");
  } catch (e) {
    console.error("❌ Database setup failed:", e.message);
    process.exit(1);
  }

  // Run seed (idempotent - won't duplicate if already seeded)
  try {
    console.log("🌱 Seeding initial data...");
    execSync("node prisma/seed.js", {
      stdio: "inherit",
      env: process.env,
    });
  } catch (e) {
    console.warn("⚠️ Seed warning (may already be seeded):", e.message.split("\n")[0]);
  }

  // Start Next.js
  console.log("🌐 Starting Next.js server...");
  const { createServer } = require("http");
  const { parse } = require("url");
  const next = require("next");

  const app = next({ dev: false });
  const handle = app.getRequestHandler();

  await app.prepare();

  const port = parseInt(process.env.PORT || "3000", 10);

  createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(port, (err) => {
    if (err) throw err;
    console.log(`✅ BOTELLAPP ready on port ${port}`);
  });
}

start().catch((e) => {
  console.error("Fatal error:", e);
  process.exit(1);
});
