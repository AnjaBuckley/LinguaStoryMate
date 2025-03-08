import { users, stories, quizzes, vocabularyItems, type Story, type InsertStory, type Quiz, type InsertQuiz, type VocabularyItem, type InsertVocabularyItem, type User, type InsertUser } from "@shared/schema";
import { db, checkDatabaseConnection } from "./db";
import { eq, sql } from "drizzle-orm";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // Story methods
  createStory(story: InsertStory): Promise<Story>;
  getStory(id: number): Promise<Story | undefined>;
  listStories(): Promise<Story[]>;

  // Quiz methods
  createQuiz(quiz: InsertQuiz): Promise<Quiz>;
  getQuiz(storyId: number): Promise<Quiz | undefined>;

  // User methods
  createUser(user: InsertUser): Promise<User>;
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  updateUser(id: number, data: Partial<User>): Promise<User>;
  updateUserStreak(userId: number): Promise<User>;

  // Vocabulary methods
  createVocabularyItems(data: { userId: number; storyId: number; words: { sourceWord: string; targetWord: string; context?: string }[] }): Promise<VocabularyItem[]>;
  getVocabularyItems(userId: number): Promise<VocabularyItem[]>;

  // Session store
  sessionStore: session.Store;
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
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
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

  async listStories(): Promise<Story[]> {
    return withRetry(async () => {
      return await db
        .select()
        .from(stories)
        .orderBy(sql`${stories.createdAt} DESC`)
        .limit(6);
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

  async updateUserStreak(userId: number): Promise<User> {
    return withRetry(async () => {
      const user = await this.getUser(userId);
      if (!user) throw new Error("User not found");

      const lastActivity = new Date(user.lastActivityDate);
      const today = new Date();
      const diffDays = Math.floor((today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));

      let currentStreak = user.currentStreak;
      if (diffDays === 1) {
        // Continue streak
        currentStreak += 1;
      } else if (diffDays > 1) {
        // Reset streak
        currentStreak = 1;
      }
      // If diffDays === 0, keep current streak (same day)

      const [updated] = await db
        .update(users)
        .set({
          currentStreak,
          lastActivityDate: new Date()
        })
        .where(eq(users.id, userId))
        .returning();

      return updated;
    });
  }

  async createVocabularyItems(data: { userId: number; storyId: number; words: { sourceWord: string; targetWord: string; context?: string }[] }): Promise<VocabularyItem[]> {
    return withRetry(async () => {
      const items = data.words.map(word => ({
        userId: data.userId,
        storyId: data.storyId,
        sourceWord: word.sourceWord,
        targetWord: word.targetWord,
        context: word.context,
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