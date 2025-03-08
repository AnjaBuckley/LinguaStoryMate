import { stories, quizzes, vocabularyItems, games, type Story, type InsertStory, type Quiz, type InsertQuiz, type VocabularyItem, type InsertVocabularyItem, type Game, type InsertGame } from "@shared/schema";
import { db, checkDatabaseConnection } from "./db";
import { eq, sql } from "drizzle-orm";

export interface IStorage {
  createStory(story: InsertStory): Promise<Story>;
  getStory(id: number): Promise<Story | undefined>;
  listStories(): Promise<Story[]>;
  createQuiz(quiz: InsertQuiz): Promise<Quiz>;
  getQuiz(storyId: number): Promise<Quiz | undefined>;
  createVocabularyItem(item: InsertVocabularyItem): Promise<VocabularyItem>;
  getVocabularyItems(storyId: number): Promise<VocabularyItem[]>;
  createGame(game: InsertGame): Promise<Game>;
  getGames(storyId: number): Promise<Game[]>;
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
      // Create the new story
      const [newStory] = await db.insert(stories).values(story).returning();

      // Clean up old stories
      await db.execute(sql`SELECT delete_old_stories()`);

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

  async createVocabularyItem(item: InsertVocabularyItem): Promise<VocabularyItem> {
    return withRetry(async () => {
      const [newItem] = await db.insert(vocabularyItems).values(item).returning();
      return newItem;
    });
  }

  async getVocabularyItems(storyId: number): Promise<VocabularyItem[]> {
    return withRetry(async () => {
      return await db
        .select()
        .from(vocabularyItems)
        .where(eq(vocabularyItems.storyId, storyId));
    });
  }

  async createGame(game: InsertGame): Promise<Game> {
    return withRetry(async () => {
      const [newGame] = await db.insert(games).values(game).returning();
      return newGame;
    });
  }

  async getGames(storyId: number): Promise<Game[]> {
    return withRetry(async () => {
      return await db
        .select()
        .from(games)
        .where(eq(games.storyId, storyId));
    });
  }
}

export const storage = new DatabaseStorage();