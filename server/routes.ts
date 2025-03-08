import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { generateStory, generateImage, generateQuiz } from "./lib/openai";
import { generateStorySchema } from "@shared/schema";

export async function registerRoutes(app: Express) {
  app.post("/api/stories/generate", async (req, res) => {
    try {
      const params = generateStorySchema.parse(req.body);
      
      const storyData = await generateStory(params);
      const imageUrl = await generateImage(storyData.title);
      const questions = await generateQuiz(storyData.content);
      
      const story = await storage.createStory({
        ...storyData,
        imageUrl,
        audioUrl: "", // TODO: Implement audio generation
        sourceLanguage: params.sourceLanguage,
        targetLanguage: params.targetLanguage,
        difficulty: params.difficulty,
      });

      const quiz = await storage.createQuiz({
        storyId: story.id,
        questions,
      });

      res.json({ story, quiz });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/stories", async (_req, res) => {
    const stories = await storage.listStories();
    res.json(stories);
  });

  app.get("/api/stories/:id", async (req, res) => {
    const story = await storage.getStory(Number(req.params.id));
    if (!story) {
      res.status(404).json({ error: "Story not found" });
      return;
    }
    res.json(story);
  });

  app.get("/api/quizzes/:storyId", async (req, res) => {
    const quiz = await storage.getQuiz(Number(req.params.storyId));
    if (!quiz) {
      res.status(404).json({ error: "Quiz not found" });
      return;
    }
    res.json(quiz);
  });

  const httpServer = createServer(app);
  return httpServer;
}
