import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { generateStory, generateImage, generateQuiz, generateAudio, extractVocabulary } from "./lib/openai";
import { generateStorySchema } from "@shared/schema";
import { setupAuth } from "./auth";
import { recommendationService } from "./lib/recommendation-service";

export async function registerRoutes(app: Express) {
  // Set up authentication routes and middleware
  setupAuth(app);

  // Existing routes...
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
      const vocabulary = await extractVocabulary(
        storyData.content,
        params.sourceLanguage,
        params.targetLanguage
      );

      const story = await storage.createStory({
        ...storyData,
        imageUrl,
        audioUrl,
        sourceLanguage: params.sourceLanguage,
        targetLanguage: params.targetLanguage,
        difficulty: params.difficulty,
        userId: req.user.id, // Add user ID to story
      });

      await Promise.all(
        vocabulary.map((item) =>
          storage.createVocabularyItem({
            storyId: story.id,
            sourceWord: item.sourceWord,
            targetWord: item.targetWord,
            context: item.context,
            difficulty: params.difficulty,
          })
        )
      );

      const quiz = await storage.createQuiz({
        storyId: story.id,
        questions,
      });

      const game = await storage.createGame({
        storyId: story.id,
        type: "matching",
        content: {
          words: vocabulary.map(({ sourceWord, targetWord, context }) => ({
            sourceWord,
            targetWord,
            context,
          })),
        },
        difficulty: params.difficulty,
      });

      res.json({ story, quiz, game });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  // Update listStories to only return user's stories
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

  app.get("/api/vocabulary/:storyId", async (req, res) => {
    try {
      const items = await storage.getVocabularyItems(Number(req.params.storyId));
      res.json(items);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/games/:storyId", async (req, res) => {
    try {
      const games = await storage.getGames(Number(req.params.storyId));
      res.json(games);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  // Add to existing routes...
  app.post("/api/learning-preferences", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    try {
      const userId = req.user.id;
      const existingPreferences = await storage.getLearningPreferences(userId);

      let preferences;
      if (existingPreferences) {
        preferences = await storage.updateLearningPreferences(userId, req.body);
      } else {
        preferences = await storage.createLearningPreferences({
          ...req.body,
          userId,
        });
      }

      // Generate new recommendations based on updated preferences
      await recommendationService.generateRecommendations(userId);

      res.json(preferences);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/learning-preferences", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    try {
      const preferences = await storage.getLearningPreferences(req.user.id);
      res.json(preferences);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/recommendations", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    try {
      const recommendations = await storage.getRecommendations(req.user.id);
      res.json(recommendations);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/recommendations/:id/viewed", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    try {
      await storage.markRecommendationViewed(Number(req.params.id));
      res.sendStatus(200);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  // Update the story completion endpoint to track progress and generate recommendations
  app.post("/api/stories/:id/complete", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    try {
      const storyId = Number(req.params.id);
      const userId = req.user.id;
      const { quizScore, vocabularyScore, timeSpent } = req.body;

      const progress = await storage.createLearningProgress({
        userId,
        storyId,
        quizScore,
        vocabularyScore,
        timeSpent,
        completed: true,
      });

      // Generate new recommendations based on completed story
      await recommendationService.generateRecommendations(userId);

      res.json(progress);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}