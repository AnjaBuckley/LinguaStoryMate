import { pgTable, text, serial, json, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").unique(),
  password: text("password").notNull(),
  interfaceLanguage: text("interface_language").default("en"),
  dailyGoalMinutes: integer("daily_goal_minutes").default(30),
  currentStreak: integer("current_streak").default(0),
  lastActivityDate: timestamp("last_activity_date").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const stories = pgTable("stories", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  title: text("title").notNull(),
  content: text("content").notNull(),
  sourceLanguage: text("source_language").notNull(),
  targetLanguage: text("target_language").notNull(),
  difficulty: text("difficulty").notNull(),
  imageUrl: text("image_url").notNull(),
  audioUrl: text("audio_url").notNull(),
  translations: json("translations").notNull().$type<Record<string, string>>(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const vocabularyItems = pgTable("vocabulary_items", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  storyId: integer("story_id").references(() => stories.id),
  sourceWord: text("source_word").notNull(),
  targetWord: text("target_word").notNull(),
  context: text("context"),
  learned: boolean("learned").default(false),
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const quizzes = pgTable("quizzes", {
  id: serial("id").primaryKey(),
  storyId: integer("story_id").references(() => stories.id),
  questions: json("questions").notNull().$type<QuizQuestion[]>(),
});

// Types
export type QuizQuestion = {
  question: string;
  options: string[];
  correctAnswer: string;
};

// Schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  currentStreak: true,
  lastActivityDate: true,
}).extend({
  password: z.string().min(6, "Password must be at least 6 characters"),
  username: z.string().min(3, "Username must be at least 3 characters"),
});

export const insertStorySchema = createInsertSchema(stories).omit({
  id: true,
  createdAt: true,
});

export const insertQuizSchema = createInsertSchema(quizzes).omit({
  id: true,
});

export const insertVocabularyItemSchema = createInsertSchema(vocabularyItems).omit({
  id: true,
  createdAt: true,
  reviewedAt: true,
  learned: true,
});

export const generateStorySchema = z.object({
  sourceLanguage: z.enum([
    "English", "Spanish", "French", "German", "Italian", 
    "Swedish", "Dutch", "Norwegian", "Danish", "Polish",
    "Hungarian", "Turkish", "Japanese", "Russian", "Chinese",
    "Portuguese"
  ]),
  targetLanguage: z.enum([
    "English", "Spanish", "French", "German", "Italian", 
    "Swedish", "Dutch", "Norwegian", "Danish", "Polish",
    "Hungarian", "Turkish", "Japanese", "Russian", "Chinese",
    "Portuguese"
  ]),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
  topic: z.string(),
});

// Types for frontend
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Story = typeof stories.$inferSelect;
export type InsertStory = z.infer<typeof insertStorySchema>;
export type Quiz = typeof quizzes.$inferSelect;
export type InsertQuiz = z.infer<typeof insertQuizSchema>;
export type VocabularyItem = typeof vocabularyItems.$inferSelect;
export type InsertVocabularyItem = z.infer<typeof insertVocabularyItemSchema>;
export type GenerateStoryRequest = z.infer<typeof generateStorySchema>;