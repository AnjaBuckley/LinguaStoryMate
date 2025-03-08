import { pgTable, text, serial, integer, json, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const stories = pgTable("stories", {
  id: serial("id").primaryKey(),
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

export const quizzes = pgTable("quizzes", {
  id: serial("id").primaryKey(),
  storyId: integer("story_id").references(() => stories.id),
  questions: json("questions").notNull().$type<QuizQuestion[]>(),
});

export type QuizQuestion = {
  question: string;
  options: string[];
  correctAnswer: string;
};

export const insertStorySchema = createInsertSchema(stories).omit({
  id: true,
  createdAt: true,
});

export const insertQuizSchema = createInsertSchema(quizzes).omit({
  id: true,
});

export type Story = typeof stories.$inferSelect;
export type InsertStory = z.infer<typeof insertStorySchema>;
export type Quiz = typeof quizzes.$inferSelect;
export type InsertQuiz = z.infer<typeof insertQuizSchema>;

export const generateStorySchema = z.object({
  sourceLanguage: z.string(),
  targetLanguage: z.string(),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
  topic: z.string(),
});

export type GenerateStoryRequest = z.infer<typeof generateStorySchema>;
