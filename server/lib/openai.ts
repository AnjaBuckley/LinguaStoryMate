import OpenAI from "openai";
import { GenerateStoryRequest, QuizQuestion } from "@shared/schema";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY environment variable is required");
}

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateStory(request: GenerateStoryRequest) {
  const prompt = `Generate a children's story with the following parameters:
- Source language: ${request.sourceLanguage}
- Target language: ${request.targetLanguage}
- Difficulty: ${request.difficulty}
- Topic: ${request.topic}

Please provide the response in this JSON format:
{
  "title": "Story title",
  "content": "Story content in source language",
  "translations": {
    "key phrases": "translations in target language"
  }
}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
  });

  return JSON.parse(response.choices[0].message.content);
}

export async function generateImage(prompt: string) {
  const response = await openai.images.generate({
    model: "dall-e-3",
    prompt: `Create a kid-friendly illustration for a children's story about: ${prompt}`,
    n: 1,
    size: "1024x1024",
    quality: "standard",
  });

  return response.data[0].url;
}

export async function generateQuiz(content: string): Promise<QuizQuestion[]> {
  const prompt = `Generate 5 multiple choice questions based on this story: ${content}
  
Response format:
{
  "questions": [
    {
      "question": "Question text",
      "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
      "correctAnswer": "Correct option"
    }
  ]
}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
  });

  const result = JSON.parse(response.choices[0].message.content);
  return result.questions;
}
