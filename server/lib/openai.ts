import OpenAI from "openai";
import { GenerateStoryRequest, QuizQuestion } from "@shared/schema";
import fetch from "node-fetch";

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

You must respond with a JSON object in this exact format:
{
  "title": "Story title in source language",
  "content": "Story content in source language",
  "translations": {
    "key phrases from content": "translation in target language"
  }
}

Make the story fun and engaging for children!`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
  });

  return JSON.parse(response.choices[0].message.content || "{}");
}

export async function generateImage(prompt: string): Promise<string> {
  const response = await openai.images.generate({
    model: "dall-e-3",
    prompt: `Create a kid-friendly illustration for a children's story about: ${prompt}`,
    n: 1,
    size: "1024x1024",
    quality: "standard",
  });

  // Download the image and convert to base64
  const imageUrl = response.data[0].url;
  const imageResponse = await fetch(imageUrl);
  const buffer = await imageResponse.arrayBuffer();
  const base64Image = Buffer.from(buffer).toString('base64');

  return `data:image/png;base64,${base64Image}`;
}

export async function generateAudio(text: string, voice = "alloy"): Promise<string> {
  const response = await openai.audio.speech.create({
    model: "tts-1",
    voice: voice,
    input: text,
  });

  // Convert the response to base64
  const audioBuffer = Buffer.from(await response.arrayBuffer());
  return `data:audio/mp3;base64,${audioBuffer.toString('base64')}`;
}

export async function generateQuiz(content: string): Promise<QuizQuestion[]> {
  const prompt = `Generate 5 multiple choice questions based on this story: ${content}

Please respond with a JSON object in this exact format:
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

  const result = JSON.parse(response.choices[0].message.content || "{}");
  return result.questions;
}

// Add this function to extract vocabulary from story content
export async function extractVocabulary(content: string, sourceLanguage: string, targetLanguage: string): Promise<Array<{ sourceWord: string; targetWord: string; context: string }>> {
  const prompt = `Extract 10 important vocabulary words from this ${sourceLanguage} text and provide their ${targetLanguage} translations. Include the context where each word appears.

Text: ${content}

Please respond with a JSON object in this exact format:
{
  "vocabulary": [
    {
      "sourceWord": "word in ${sourceLanguage}",
      "targetWord": "translation in ${targetLanguage}",
      "context": "sentence or phrase where the word appears"
    }
  ]
}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
  });

  const result = JSON.parse(response.choices[0].message.content || "{}");
  return result.vocabulary || [];
}