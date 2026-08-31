import "dotenv/config";
import { db } from "./server/db";
import { users, sessions } from "./shared/schema";
import { sql } from "drizzle-orm";

async function initDatabase() {
  try {
    console.log("Creating database tables...");

    // Create users table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR NOT NULL UNIQUE,
        password TEXT NOT NULL,
        name VARCHAR,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `);
    console.log("✅ Users table created");

    // Create sessions table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS sessions (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR,
        topic TEXT,
        mode VARCHAR DEFAULT 'practice',
        duration INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        eye_contact_percentage REAL NOT NULL,
        confidence_score REAL NOT NULL,
        words_per_minute REAL NOT NULL,
        filler_words_count INTEGER NOT NULL,
        posture_score REAL DEFAULT 0,
        posture_data JSONB DEFAULT '[]'::jsonb,
        transcript TEXT,
        strengths JSONB NOT NULL,
        improvements JSONB NOT NULL,
        eye_contact_data JSONB NOT NULL,
        is_public BOOLEAN DEFAULT false
      )
    `);
    console.log("✅ Sessions table created");

    console.log("\n✅ Database initialized successfully!");
    process.exit(0);
  } catch (error: any) {
    console.error("❌ Error initializing database:", error.message);
    process.exit(1);
  }
}

initDatabase();


