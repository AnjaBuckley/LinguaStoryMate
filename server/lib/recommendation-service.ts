import { storage } from "../storage";
import type {
  Story,
  LearningProgress,
  LearningPreferences,
  InsertRecommendation,
} from "@shared/schema";

export class RecommendationService {
  private async calculateUserLevel(userId: number, language: string): Promise<string> {
    const stories = await storage.listStories();
    const userStories = stories.filter(story => story.userId === userId);

    let totalScore = 0;
    let completedStories = 0;

    for (const story of userStories) {
      const progress = await storage.getLearningProgress(userId, story.id);
      if (progress?.completed) {
        totalScore += (progress.quizScore || 0);
        completedStories++;
      }
    }

    const averageScore = completedStories > 0 ? totalScore / completedStories : 0;

    if (averageScore >= 80) return "advanced";
    if (averageScore >= 60) return "intermediate";
    return "beginner";
  }

  private async findSimilarStories(story: Story, preferences: LearningPreferences): Promise<Story[]> {
    const allStories = await storage.listStories();

    return allStories.filter(s => 
      s.id !== story.id &&
      (s.sourceLanguage === story.sourceLanguage || s.targetLanguage === story.targetLanguage) &&
      preferences.preferredTopics.some(topic => 
        s.title.toLowerCase().includes(topic.toLowerCase())
      )
    );
  }

  private calculatePriority(
    story: Story,
    userLevel: string,
    preferences: LearningPreferences
  ): number {
    let priority = 3; // Default priority

    // Adjust based on difficulty match
    if (story.difficulty === preferences.preferredDifficulty) priority += 1;
    if (story.difficulty === userLevel) priority += 1;

    // Adjust based on language match
    if (preferences.preferredLanguages.includes(story.sourceLanguage)) priority += 1;
    if (preferences.preferredLanguages.includes(story.targetLanguage)) priority += 1;

    // Ensure priority stays within bounds
    return Math.min(Math.max(priority, 1), 5);
  }

  public async generateRecommendations(userId: number): Promise<void> {
    // First, clean up old recommendations for this user
    await storage.deleteUserRecommendations(userId);

    const preferences = await storage.getLearningPreferences(userId);
    if (!preferences) return;

    const stories = await storage.listStories();
    const userProgress = new Map<number, LearningProgress>();

    // Get user's current level for each language
    const languageLevels = new Map<string, string>();
    for (const lang of preferences.preferredLanguages) {
      languageLevels.set(lang, await this.calculateUserLevel(userId, lang));
    }

    // Generate recommendations only for stories that match preferred languages
    for (const story of stories) {
      // Skip stories the user has already completed
      const progress = await storage.getLearningProgress(userId, story.id);
      if (progress?.completed) continue;

      // Only recommend stories that match user's preferred languages
      if (!preferences.preferredLanguages.includes(story.sourceLanguage) && 
          !preferences.preferredLanguages.includes(story.targetLanguage)) {
        continue;
      }

      const userLevel = languageLevels.get(story.sourceLanguage) || "beginner";
      const priority = this.calculatePriority(story, userLevel, preferences);

      let reason = "Matches your learning preferences";
      if (story.difficulty === userLevel) {
        reason = "Perfect match for your current level";
      } else if (priority >= 4) {
        reason = "Highly recommended based on your interests";
      }

      const recommendation: InsertRecommendation = {
        userId,
        storyId: story.id,
        reason,
        priority,
        viewed: false,
      };

      await storage.createRecommendation(recommendation);
    }
  }
}

export const recommendationService = new RecommendationService();