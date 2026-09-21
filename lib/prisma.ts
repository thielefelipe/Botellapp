import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const dbUrl = process.env.DATABASE_URL || "";

  // SQLite / libsql local development
  if (!dbUrl || dbUrl.startsWith("file:") || dbUrl.startsWith("libsql:")) {
    const { PrismaLibSql } = require("@prisma/adapter-libsql");
    const path = require("path") as typeof import("path");

    let url = dbUrl;
    if (!url || url === "file:./dev.db") {
      url = "file:" + path.resolve(process.cwd(), "dev.db");
    }

    const authToken = process.env.DATABASE_AUTH_TOKEN;
    const adapter = new PrismaLibSql({ url, authToken });
    return new PrismaClient({ adapter });
  }

  // PostgreSQL (Render production)
  const { Pool } = require("pg") as typeof import("pg");
  const { PrismaPg } = require("@prisma/adapter-pg");
  const pool = new Pool({
    connectionString: dbUrl,
    ssl: dbUrl.includes("sslmode=require") || process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
  });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
