import { InsertStory, Story, Quiz, InsertQuiz, QuizQuestion } from "@shared/schema";

export interface IStorage {
  createStory(story: InsertStory): Promise<Story>;
  getStory(id: number): Promise<Story | undefined>;
  listStories(): Promise<Story[]>;
  createQuiz(quiz: InsertQuiz): Promise<Quiz>;
  getQuiz(storyId: number): Promise<Quiz | undefined>;
}

export class MemStorage implements IStorage {
  private stories: Map<number, Story>;
  private quizzes: Map<number, Quiz>;
  private storyIdCounter: number;
  private quizIdCounter: number;

  constructor() {
    this.stories = new Map();
    this.quizzes = new Map();
    this.storyIdCounter = 1;
    this.quizIdCounter = 1;
  }

  async createStory(story: InsertStory): Promise<Story> {
    const id = this.storyIdCounter++;
    const newStory: Story = {
      ...story,
      id,
      createdAt: new Date(),
    };
    this.stories.set(id, newStory);
    return newStory;
  }

  async getStory(id: number): Promise<Story | undefined> {
    return this.stories.get(id);
  }

  async listStories(): Promise<Story[]> {
    return Array.from(this.stories.values());
  }

  async createQuiz(quiz: InsertQuiz): Promise<Quiz> {
    const id = this.quizIdCounter++;
    const newQuiz: Quiz = {
      ...quiz,
      id,
    };
    this.quizzes.set(id, newQuiz);
    return newQuiz;
  }

  async getQuiz(storyId: number): Promise<Quiz | undefined> {
    return Array.from(this.quizzes.values()).find(
      (quiz) => quiz.storyId === storyId
    );
  }
}

export const storage = new MemStorage();
