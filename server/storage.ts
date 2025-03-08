import { stories, quizzes, type Story, type InsertStory, type Quiz, type InsertQuiz } from "@shared/schema";
import { db, checkDatabaseConnection } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  createStory(story: InsertStory): Promise<Story>;
  getStory(id: number): Promise<Story | undefined>;
  listStories(): Promise<Story[]>;
  createQuiz(quiz: InsertQuiz): Promise<Quiz>;
  getQuiz(storyId: number): Promise<Quiz | undefined>;
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
      return await db.select().from(stories);
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
}

export const storage = new DatabaseStorage();