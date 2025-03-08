import { pgTable, text, serial, json, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("student"),
  preferredLanguage: text("preferred_language").default("en"),
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

export const quizzes = pgTable("quizzes", {
  id: serial("id").primaryKey(),
  storyId: integer("story_id").references(() => stories.id),
  questions: json("questions").notNull().$type<QuizQuestion[]>(),
});

// New tables for vocabulary games
export const vocabularyItems = pgTable("vocabulary_items", {
  id: serial("id").primaryKey(),
  storyId: integer("story_id").references(() => stories.id),
  sourceWord: text("source_word").notNull(),
  targetWord: text("target_word").notNull(),
  context: text("context"),
  difficulty: text("difficulty").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const games = pgTable("games", {
  id: serial("id").primaryKey(),
  storyId: integer("story_id").references(() => stories.id),
  type: text("type").notNull(), // 'matching', 'flashcard', 'fill-blank'
  content: json("content").notNull().$type<GameContent>(),
  difficulty: text("difficulty").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// New table for tracking learning progress
export const learningProgress = pgTable("learning_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  storyId: integer("story_id").references(() => stories.id),
  quizScore: integer("quiz_score"),
  vocabularyScore: integer("vocabulary_score"),
  timeSpent: integer("time_spent"), // in seconds
  completed: boolean("completed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Table for learning preferences
export const learningPreferences = pgTable("learning_preferences", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  preferredLanguages: json("preferred_languages").notNull().$type<string[]>(),
  preferredTopics: json("preferred_topics").notNull().$type<string[]>(),
  preferredDifficulty: text("preferred_difficulty").notNull(),
  learningGoals: json("learning_goals").notNull().$type<string[]>(),
  dailyGoalMinutes: integer("daily_goal_minutes").default(30),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Table for recommendations
export const recommendations = pgTable("recommendations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  storyId: integer("story_id").references(() => stories.id),
  reason: text("reason").notNull(),
  priority: integer("priority").notNull(), // 1-5, higher is more recommended
  viewed: boolean("viewed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// New table for parent-child relationships
export const parentChildRelations = pgTable("parent_child_relations", {
  id: serial("id").primaryKey(),
  parentId: integer("parent_id").references(() => users.id),
  childId: integer("child_id").references(() => users.id),
  relationshipType: text("relationship_type").notNull(), // e.g., "parent", "guardian"
  createdAt: timestamp("created_at").defaultNow(),
});

// New table for learning analytics
export const learningAnalytics = pgTable("learning_analytics", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  period: text("period").notNull(), // "daily", "weekly", "monthly"
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  totalTimeSpent: integer("total_time_spent").notNull(),
  averageScore: integer("average_score").notNull(),
  languageProgress: json("language_progress").$type<Record<string, number>>(), // language -> proficiency level
  strengthAreas: json("strength_areas").$type<string[]>(),
  improvementAreas: json("improvement_areas").$type<string[]>(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Types
export type QuizQuestion = {
  question: string;
  options: string[];
  correctAnswer: string;
};

export type GameContent = {
  words: Array<{
    sourceWord: string;
    targetWord: string;
    context?: string;
  }>;
  hints?: string[];
};

// Schemas
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
});

export const insertGameSchema = createInsertSchema(games).omit({
  id: true,
  createdAt: true,
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
}).extend({
  password: z.string().min(6, "Password must be at least 6 characters"),
  username: z.string().min(3, "Username must be at least 3 characters"),
});

// Add schemas for new tables
export const insertLearningProgressSchema = createInsertSchema(learningProgress).omit({
  id: true,
  createdAt: true,
});

export const insertLearningPreferencesSchema = createInsertSchema(learningPreferences).omit({
  id: true,
  updatedAt: true,
});

export const insertRecommendationSchema = createInsertSchema(recommendations).omit({
  id: true,
  createdAt: true,
});

export const insertParentChildRelationSchema = createInsertSchema(parentChildRelations).omit({
  id: true,
  createdAt: true,
});

export const insertLearningAnalyticsSchema = createInsertSchema(learningAnalytics).omit({
  id: true,
  createdAt: true,
});

// Types for frontend
export type Story = typeof stories.$inferSelect;
export type InsertStory = z.infer<typeof insertStorySchema>;
export type Quiz = typeof quizzes.$inferSelect;
export type InsertQuiz = z.infer<typeof insertQuizSchema>;
export type VocabularyItem = typeof vocabularyItems.$inferSelect;
export type InsertVocabularyItem = z.infer<typeof insertVocabularyItemSchema>;
export type Game = typeof games.$inferSelect;
export type InsertGame = z.infer<typeof insertGameSchema>;
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

// Add types for frontend
export type LearningProgress = typeof learningProgress.$inferSelect;
export type InsertLearningProgress = z.infer<typeof insertLearningProgressSchema>;
export type LearningPreferences = typeof learningPreferences.$inferSelect;
export type InsertLearningPreferences = z.infer<typeof insertLearningPreferencesSchema>;
export type Recommendation = typeof recommendations.$inferSelect;
export type InsertRecommendation = z.infer<typeof insertRecommendationSchema>;
export type ParentChildRelation = typeof parentChildRelations.$inferSelect;
export type InsertParentChildRelation = z.infer<typeof insertParentChildRelationSchema>;
export type LearningAnalytics = typeof learningAnalytics.$inferSelect;
export type InsertLearningAnalytics = z.infer<typeof insertLearningAnalyticsSchema>;

export const userRoleSchema = z.enum(["student", "parent"]);
export type UserRole = z.infer<typeof userRoleSchema>;


export const generateStorySchema = z.object({
  sourceLanguage: z.string(),
  targetLanguage: z.string(),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
  topic: z.string(),
});

export type GenerateStoryRequest = z.infer<typeof generateStorySchema>;