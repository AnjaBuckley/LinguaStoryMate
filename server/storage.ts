import { pgTable, text, serial, json, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { db, checkDatabaseConnection, pool } from "./db";
import { eq, sql, and } from "drizzle-orm";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { randomBytes, scrypt } from 'crypto';
import { promisify } from 'util';
import { users, stories, quizzes, vocabularyItems, completedStories, type Story, type InsertStory, type Quiz, type InsertQuiz, type VocabularyItem, type InsertVocabularyItem, type User, type InsertUser } from "@shared/schema";

const scryptAsync = promisify(scrypt);
const PostgresStore = connectPgSimple(session);

export interface IStorage {
  // Story methods
  createStory(story: InsertStory): Promise<Story>;
  getStory(id: number): Promise<Story | undefined>;
  listStories(limit?: number): Promise<Story[]>;

  // Quiz methods
  createQuiz(quiz: InsertQuiz): Promise<Quiz>;
  getQuiz(storyId: number): Promise<Quiz | undefined>;

  // User methods
  createUser(user: InsertUser): Promise<User>;
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  updateUser(id: number, data: Partial<User>): Promise<User>;
  updateUserProgress(userId: number): Promise<User>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByResetToken(token: string): Promise<User | undefined>;
  hashPassword(password: string): Promise<string>;

  // Vocabulary methods
  createVocabularyItems(data: { userId: number; storyId: number; words: { sourceWord: string; targetWord: string; context?: string }[] }): Promise<VocabularyItem[]>;
  getVocabularyItems(userId: number): Promise<VocabularyItem[]>;

  // Session store
  sessionStore: session.Store;

  // Add new method for completed stories
  createCompletedStory(data: { userId: number; storyId: number; timeSpent?: number; quizScore?: number }): Promise<typeof completedStories.$inferSelect>;
  getCompletedStories(userId: number): Promise<(typeof completedStories.$inferSelect)[]>;
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

async function withRetry<T>(operation: () => Promise<T>): Promise<T> {
  let lastError;
  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (i < MAX_RETRIES - 1) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        await checkDatabaseConnection();
      }
    }
  }
  throw lastError;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    // Use PostgreSQL-backed session store for production
    // This ensures sessions persist across server restarts
    this.sessionStore = new PostgresStore({
      pool: pool as any,
      tableName: 'session',
      createTableIfMissing: true,
      pruneSessionInterval: 60 * 15, // Prune expired sessions every 15 minutes
    });
  }

  async createStory(story: InsertStory): Promise<Story> {
    return withRetry(async () => {
      const [newStory] = await db.insert(stories).values(story).returning();
      return newStory;
    });
  }

  async getStory(id: number): Promise<Story | undefined> {
    return withRetry(async () => {
      const [story] = await db.select().from(stories).where(eq(stories.id, id));
      return story;
    });
  }

  async listStories(limit?: number): Promise<Story[]> {
    return withRetry(async () => {
      let query = db
        .select()
        .from(stories)
        .orderBy(sql`${stories.createdAt} DESC`);

      if (limit) {
        query = query.limit(limit);
      }

      return await query;
    });
  }

  async createQuiz(quiz: InsertQuiz): Promise<Quiz> {
    return withRetry(async () => {
      const [newQuiz] = await db.insert(quizzes).values(quiz).returning();
      return newQuiz;
    });
  }

  async getQuiz(storyId: number): Promise<Quiz | undefined> {
    return withRetry(async () => {
      const [quiz] = await db
        .select()
        .from(quizzes)
        .where(eq(quizzes.storyId, storyId));
      return quiz;
    });
  }

  async createUser(user: InsertUser): Promise<User> {
    return withRetry(async () => {
      const [newUser] = await db.insert(users).values(user).returning();
      return newUser;
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return withRetry(async () => {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      return user;
    });
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return withRetry(async () => {
      const [user] = await db.select().from(users).where(eq(users.username, username));
      return user;
    });
  }

  async updateUser(id: number, data: Partial<User>): Promise<User> {
    return withRetry(async () => {
      const [updated] = await db
        .update(users)
        .set(data)
        .where(eq(users.id, id))
        .returning();
      return updated;
    });
  }

  async updateUserProgress(userId: number): Promise<User> {
    return withRetry(async () => {
      const user = await this.getUser(userId);
      if (!user) throw new Error("User not found");

      // Get total completed stories for this user
      const completedStoriesResult = await db
        .select()
        .from(completedStories)
        .where(eq(completedStories.userId, userId));

      const storiesCompleted = completedStoriesResult.length;

      const [updated] = await db
        .update(users)
        .set({
          storiesCompleted,
          lastActivityDate: new Date()
        })
        .where(eq(users.id, userId))
        .returning();

      return updated;
    });
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return withRetry(async () => {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, email));
      return user;
    });
  }

  async getUserByResetToken(token: string): Promise<User | undefined> {
    return withRetry(async () => {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.resetPasswordToken, token));
      return user;
    });
  }

  async hashPassword(password: string): Promise<string> {
    const salt = randomBytes(16).toString("hex");
    const buf = (await scryptAsync(password, salt, 64)) as Buffer;
    return `${buf.toString("hex")}.${salt}`;
  }

  async createCompletedStory(data: { userId: number; storyId: number; timeSpent?: number; quizScore?: number }) {
    return withRetry(async () => {
      const [completed] = await db.insert(completedStories).values(data).returning();
      return completed;
    });
  }

  async getCompletedStories(userId: number) {
    return withRetry(async () => {
      return await db
        .select()
        .from(completedStories)
        .where(eq(completedStories.userId, userId))
        .orderBy(sql`${completedStories.completedAt} DESC`);
    });
  }

  async createVocabularyItems(data: { userId: number; storyId: number; words: { sourceWord: string; targetWord: string; context?: string }[] }): Promise<VocabularyItem[]> {
    return withRetry(async () => {
      if (!data.words || data.words.length === 0) {
        return [];
      }

      const items = data.words.map(word => ({
        userId: data.userId,
        storyId: data.storyId,
        sourceWord: word.sourceWord,
        targetWord: word.targetWord,
        context: word.context,
        learned: false
      }));

      return await db.insert(vocabularyItems).values(items).returning();
    });
  }

  async getVocabularyItems(userId: number): Promise<VocabularyItem[]> {
    return withRetry(async () => {
      return await db
        .select()
        .from(vocabularyItems)
        .where(eq(vocabularyItems.userId, userId))
        .orderBy(sql`${vocabularyItems.createdAt} DESC`);
    });
  }
}

export const storage = new DatabaseStorage();