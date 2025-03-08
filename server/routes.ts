import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { generateStory, generateImage, generateQuiz, generateAudio } from "./lib/openai";
import { generateStorySchema } from "@shared/schema";
import { setupAuth } from "./auth";
import { createTransport } from "nodemailer";
import { randomBytes } from "crypto";

// Configure nodemailer
const transporter = createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export async function registerRoutes(app: Express) {
  setupAuth(app);

  // Add password reset endpoints
  app.post("/api/reset-password-request", async (req, res) => {
    try {
      const { email } = req.body;
      const user = await storage.getUserByEmail(email);

      if (!user) {
        return res.status(404).json({ error: "No account with that email address exists." });
      }

      const token = randomBytes(20).toString('hex');
      const expires = new Date();
      expires.setHours(expires.getHours() + 1); // Token expires in 1 hour

      await storage.updateUser(user.id, {
        resetPasswordToken: token,
        resetPasswordExpires: expires,
      });

      const resetUrl = `${process.env.APP_URL}/reset-password/${token}`;

      await transporter.sendMail({
        to: user.email,
        subject: "Password Reset Request",
        html: `
          <p>You requested a password reset for your Language Learning Adventures account.</p>
          <p>Please click on the following link to reset your password:</p>
          <a href="${resetUrl}">${resetUrl}</a>
          <p>This link will expire in 1 hour.</p>
          <p>If you did not request this, please ignore this email.</p>
        `,
      });

      res.json({ message: "Password reset email sent" });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/reset-password/:token", async (req, res) => {
    try {
      const { token } = req.params;
      const { password } = req.body;

      const user = await storage.getUserByResetToken(token);

      if (!user) {
        return res.status(400).json({ error: "Password reset token is invalid or has expired." });
      }

      if (user.resetPasswordExpires && new Date() > new Date(user.resetPasswordExpires)) {
        return res.status(400).json({ error: "Password reset token has expired." });
      }

      await storage.updateUser(user.id, {
        password: await storage.hashPassword(password),
        resetPasswordToken: null,
        resetPasswordExpires: null,
      });

      res.json({ message: "Password has been reset" });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

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

  // Update the story completion endpoint to handle empty vocabulary properly
  app.post("/api/stories/:id/complete", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    try {
      const storyId = Number(req.params.id);
      const userId = req.user.id;
      const { quizScore, timeSpent, vocabulary = [] } = req.body;

      // Update user streak
      const user = await storage.updateUserStreak(userId);

      let vocabularyItems = [];
      if (vocabulary.length > 0) {
        vocabularyItems = await storage.createVocabularyItems({
          userId,
          storyId,
          words: vocabulary
        });
      }

      res.json({ user, vocabularyItems });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}