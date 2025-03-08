import { stories, quizzes, type Story, type InsertStory, type Quiz, type InsertQuiz } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  createStory(story: InsertStory): Promise<Story>;
  getStory(id: number): Promise<Story | undefined>;
  listStories(): Promise<Story[]>;
  createQuiz(quiz: InsertQuiz): Promise<Quiz>;
  getQuiz(storyId: number): Promise<Quiz | undefined>;
}

export class DatabaseStorage implements IStorage {
  async createStory(story: InsertStory): Promise<Story> {
    const [newStory] = await db.insert(stories).values(story).returning();
    return newStory;
  }

  async getStory(id: number): Promise<Story | undefined> {
    const [story] = await db.select().from(stories).where(eq(stories.id, id));
    return story;
  }

  async listStories(): Promise<Story[]> {
    return await db.select().from(stories);
  }

  async createQuiz(quiz: InsertQuiz): Promise<Quiz> {
    const [newQuiz] = await db.insert(quizzes).values(quiz).returning();
    return newQuiz;
  }

  async getQuiz(storyId: number): Promise<Quiz | undefined> {
    const [quiz] = await db
      .select()
      .from(quizzes)
      .where(eq(quizzes.storyId, storyId));
    return quiz;
  }
}

export const storage = new DatabaseStorage();