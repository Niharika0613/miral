import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, real, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").notNull().unique(),
  password: text("password").notNull(),
  name: varchar("name"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const sessions = pgTable("sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id"),
  topic: text("topic"),
  mode: varchar("mode").default('practice'), // practice, learning, analysis
  duration: integer("duration").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  eyeContactPercentage: real("eye_contact_percentage").notNull(),
  confidenceScore: real("confidence_score").notNull(),
  wordsPerMinute: real("words_per_minute").notNull(),
  fillerWordsCount: integer("filler_words_count").notNull(),
  postureScore: real("posture_score").default(0),
  postureData: jsonb("posture_data").$type<{ timestamp: number; posture: string; confidence: number }[]>().default([]),
  transcript: text("transcript"),
  strengths: jsonb("strengths").$type<string[]>().notNull(),
  improvements: jsonb("improvements").$type<string[]>().notNull(),
  eyeContactData: jsonb("eye_contact_data").$type<{ timestamp: number; hasEyeContact: boolean }[]>().notNull(),
  isPublic: boolean("is_public").default(false),
});

export const insertSessionSchema = createInsertSchema(sessions).omit({
  id: true,
  createdAt: true,
  userId: true,
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional(),
});

export type InsertSession = z.infer<typeof insertSessionSchema>;
export type Session = typeof sessions.$inferSelect;
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
