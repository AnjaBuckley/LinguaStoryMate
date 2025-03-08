import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { generateStory, generateImage, generateQuiz, generateAudio } from "./lib/openai";
import { generateStorySchema } from "@shared/schema";
import { setupAuth } from "./auth";

export async function registerRoutes(app: Express) {
  // Set up authentication routes and middleware
  setupAuth(app);

  app.post("/api/stories/generate", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const params = generateStorySchema.parse(req.body);
      const storyData = await generateStory(params);
      const imageUrl = await generateImage(storyData.title);
      const audioUrl = await generateAudio(storyData.content);
      const questions = await generateQuiz(storyData.content);

      const story = await storage.createStory({
        ...storyData,
        imageUrl,
        audioUrl,
        sourceLanguage: params.sourceLanguage,
        targetLanguage: params.targetLanguage,
        difficulty: params.difficulty,
        userId: req.user.id,
      });

      const quiz = await storage.createQuiz({
        storyId: story.id,
        questions,
      });

      res.json({ story, quiz });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/stories", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    const stories = await storage.listStories();
    res.json(stories.filter((story) => story.userId === req.user.id));
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

  // User settings endpoints
  app.patch("/api/users/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated() || req.user.id !== Number(req.params.id)) {
        return res.status(401).json({ error: "Not authorized" });
      }

      const updatedUser = await storage.updateUser(Number(req.params.id), req.body);
      res.json(updatedUser);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/stories/:id/complete", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    try {
      const storyId = Number(req.params.id);
      const userId = req.user.id;
      const { quizScore, timeSpent } = req.body;

      // Update user streak
      const user = await storage.updateUserStreak(userId);

      const vocabularyItems = await storage.createVocabularyItems({
        userId,
        storyId,
        words: req.body.vocabulary || [],
      });

      res.json({ user, vocabularyItems });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}