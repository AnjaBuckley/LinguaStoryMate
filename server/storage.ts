import { users, stories, quizzes, vocabularyItems, games, learningProgress, learningPreferences, recommendations, type Story, type InsertStory, type Quiz, type InsertQuiz, type VocabularyItem, type InsertVocabularyItem, type Game, type InsertGame, type User, type InsertUser, type LearningProgress, type InsertLearningProgress, type LearningPreferences, type InsertLearningPreferences, type Recommendation, type InsertRecommendation } from "@shared/schema";
import { db, checkDatabaseConnection } from "./db";
import { eq, sql, and, desc } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

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

  // User methods
  createUser(user: InsertUser): Promise<User>;
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;

  // Session store
  sessionStore: session.Store;

  // Learning progress methods
  createLearningProgress(progress: InsertLearningProgress): Promise<LearningProgress>;
  getLearningProgress(userId: number, storyId: number): Promise<LearningProgress | undefined>;
  updateLearningProgress(id: number, progress: Partial<InsertLearningProgress>): Promise<LearningProgress>;

  // Learning preferences methods
  createLearningPreferences(preferences: InsertLearningPreferences): Promise<LearningPreferences>;
  getLearningPreferences(userId: number): Promise<LearningPreferences | undefined>;
  updateLearningPreferences(userId: number, preferences: Partial<InsertLearningPreferences>): Promise<LearningPreferences>;

  // Recommendation methods
  createRecommendation(recommendation: InsertRecommendation): Promise<Recommendation>;
  getRecommendations(userId: number): Promise<Recommendation[]>;
  markRecommendationViewed(id: number): Promise<void>;
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
    // Use MemoryStore for development to avoid session store setup issues
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });
  }

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
      const [newQuiz] = await db.insert(quizzes).values([quiz]).returning();
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
      const [newGame] = await db.insert(games).values([game]).returning();
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

  async createLearningProgress(progress: InsertLearningProgress): Promise<LearningProgress> {
    return withRetry(async () => {
      const [newProgress] = await db.insert(learningProgress).values(progress).returning();
      return newProgress;
    });
  }

  async getLearningProgress(userId: number, storyId: number): Promise<LearningProgress | undefined> {
    return withRetry(async () => {
      const [progress] = await db
        .select()
        .from(learningProgress)
        .where(and(eq(learningProgress.userId, userId), eq(learningProgress.storyId, storyId)));
      return progress;
    });
  }

  async updateLearningProgress(id: number, progress: Partial<InsertLearningProgress>): Promise<LearningProgress> {
    return withRetry(async () => {
      const [updated] = await db
        .update(learningProgress)
        .set(progress)
        .where(eq(learningProgress.id, id))
        .returning();
      return updated;
    });
  }

  async createLearningPreferences(preferences: InsertLearningPreferences): Promise<LearningPreferences> {
    return withRetry(async () => {
      const [newPreferences] = await db.insert(learningPreferences).values(preferences).returning();
      return newPreferences;
    });
  }

  async getLearningPreferences(userId: number): Promise<LearningPreferences | undefined> {
    return withRetry(async () => {
      const [preferences] = await db
        .select()
        .from(learningPreferences)
        .where(eq(learningPreferences.userId, userId));
      return preferences;
    });
  }

  async updateLearningPreferences(userId: number, preferences: Partial<InsertLearningPreferences>): Promise<LearningPreferences> {
    return withRetry(async () => {
      const [updated] = await db
        .update(learningPreferences)
        .set({ ...preferences, updatedAt: new Date() })
        .where(eq(learningPreferences.userId, userId))
        .returning();
      return updated;
    });
  }

  async createRecommendation(recommendation: InsertRecommendation): Promise<Recommendation> {
    return withRetry(async () => {
      const [newRecommendation] = await db.insert(recommendations).values(recommendation).returning();
      return newRecommendation;
    });
  }

  async getRecommendations(userId: number): Promise<Recommendation[]> {
    return withRetry(async () => {
      return await db
        .select()
        .from(recommendations)
        .where(eq(recommendations.userId, userId))
        .orderBy(desc(recommendations.priority));
    });
  }

  async markRecommendationViewed(id: number): Promise<void> {
    return withRetry(async () => {
      await db
        .update(recommendations)
        .set({ viewed: true })
        .where(eq(recommendations.id, id));
    });
  }
}

export const storage = new DatabaseStorage();