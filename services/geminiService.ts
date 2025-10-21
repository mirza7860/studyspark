import { GoogleGenAI, Type } from "@google/genai";
import type { ChatMessage, QuizQuestion, Flashcard } from "../types";

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const model = ai.models;

const safetySettings = [
  {
    category: "HARM_CATEGORY_HARASSMENT",
    threshold: "BLOCK_NONE",
  },
  {
    category: "HARM_CATEGORY_HATE_SPEECH",
    threshold: "BLOCK_NONE",
  },
  {
    category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
    threshold: "BLOCK_NONE",
  },
  {
    category: "HARM_CATEGORY_DANGEROUS_CONTENT",
    threshold: "BLOCK_NONE",
  },
];

export const getChatResponse = async (
  documentText: string,
  history: ChatMessage[],
  newMessage: string
): Promise<string> => {
  const chatHistory = history.map((msg) => ({
    role: msg.role,
    parts: [{ text: msg.text }],
  }));

  const chat = ai.chats.create({
    model: "gemini-2.5-flash-lite",

    config: {
      systemInstruction: `You are a helpful learning assistant. Your task is to answer questions based *only* on the provided document context. If the answer cannot be found in the context, state that clearly. Do not use any external knowledge. Here is the document context:\n\n---\n${documentText}\n---`,
      maxOutputTokens: 2048,
    },
    history: chatHistory,
  });

  const response = await chat.sendMessage({ message: newMessage });
  return response.text;
};

export const generateSummary = async (
  documentText: string,
  summaryType: string,
  fromPage: string,
  toPage: string
): Promise<string> => {
  const prompt = `Please provide a ${summaryType} summary of the following document${
    fromPage && toPage ? ` from page ${fromPage} to page ${toPage}` : ""
  }. Focus on the key points and main arguments.

Document:
---
${documentText}
---`;
  const response = await model.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      safetySettings,
      temperature: 0.3,
    },
  });
  return response.text;
};

export const generateQuiz = async (
  documentText: string,
  numQuestions: number
): Promise<QuizQuestion[]> => {
  const response = await model.generateContent({
    model: "gemini-2.5-flash",
    contents: `Based on the following document, generate a multiple-choice quiz with ${numQuestions} questions. Each question should have 4 options, and one correct answer.

Document:
---
${documentText}
---`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            options: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            correctAnswer: { type: Type.STRING },
          },
          required: ["question", "options", "correctAnswer"],
        },
      },
      safetySettings,
    },
  });

  const jsonText = response.text.trim();
  return JSON.parse(jsonText);
};

export const generateFlashcards = async (
  documentText: string,
  numFlashcards: number
): Promise<Flashcard[]> => {
  const response = await model.generateContent({
    model: "gemini-2.5-flash",
    contents: `Based on the following document, generate ${numFlashcards} flashcards. Each flashcard should have a key term and a concise definition.

Document:
---
${documentText}
---`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            term: { type: Type.STRING },
            definition: { type: Type.STRING },
          },
          required: ["term", "definition"],
        },
      },
      safetySettings,
    },
  });
  const jsonText = response.text.trim();
  return JSON.parse(jsonText);
};
