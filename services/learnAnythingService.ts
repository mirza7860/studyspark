import { GoogleGenAI, Type } from "@google/genai";
import { LearningModule, QuizQuestion, SubModule, Lesson, OneLineQuestion, ModuleStatus, SubModuleStatus } from "../types";

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

class LearnAnythingService {
  async generateLearningContent(topic: string): Promise<LearningModule[]> {
    const prompt = `Generate a highly detailed and extensive structured learning path for the topic: "${topic}".\n\nProvide the content as an array of learning modules. For the first module, provide extensive details for its sub-modules, including multiple lessons and a comprehensive exercise section (a mix of multiple-choice quizzes and one-line questions). Each sub-module should have a title, a detailed content overview, an array of multiple lessons, and an array of exercises. Each lesson should have a title and extensive content (at least 200-300 words). Each exercise can be either a multiple-choice quiz question (with 4 options and one correct answer) or a one-line question (with a single correct answer). For subsequent modules, provide only the title and a brief description, marking them as 'locked'. Ensure all IDs are unique strings.`;

    const response = await model.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              status: { type: Type.STRING, enum: ["locked", "unlocked", "completed"] },
              subModules: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    title: { type: Type.STRING },
                    content: { type: Type.STRING },
                    status: { type: Type.STRING, enum: ["locked", "unlocked", "completed"] },
                    lessons: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          id: { type: Type.STRING },
                          title: { type: Type.STRING },
                          content: { type: Type.STRING },
                        },
                        required: ["id", "title", "content"],
                      },
                    },
                    exercises: {
                      type: Type.ARRAY,
                      items: {
                        oneOf: [
                          {
                            type: Type.OBJECT,
                            properties: {
                              id: { type: Type.STRING },
                              question: { type: Type.STRING },
                              options: { type: Type.ARRAY, items: { type: Type.STRING } },
                              correctAnswer: { type: Type.STRING },
                            },
                            required: ["id", "question", "options", "correctAnswer"],
                          },
                          {
                            type: Type.OBJECT,
                            properties: {
                              id: { type: Type.STRING },
                              question: { type: Type.STRING },
                              correctAnswer: { type: Type.STRING },
                            },
                            required: ["id", "question", "correctAnswer"],
                          },
                        ],
                      },
                    },
                  },
                  required: ["id", "title", "content", "lessons", "exercises", "status"],
                },
              },
            },
            required: ["id", "title", "description", "subModules", "status"],
          },
        },
        safetySettings,
      },
    });

    const jsonText = response.text.trim();
    const modules: LearningModule[] = JSON.parse(jsonText);

    // Ensure the first module is unlocked and subsequent ones are locked
    if (modules.length > 0) {
      modules[0].status = 'unlocked';
      if (modules[0].subModules.length > 0) {
        modules[0].subModules[0].status = 'unlocked';
      }
      for (let i = 1; i < modules.length; i++) {
        modules[i].status = 'locked';
        modules[i].subModules = []; // Clear sub-modules for locked modules
      }
    }

    return modules;
  }

  async generateDetailedModuleContent(moduleTitle: string, topic: string): Promise<SubModule[]> {
    const prompt = `Generate highly detailed and extensive sub-modules for the module titled "${moduleTitle}" within the broader topic of "${topic}". Each sub-module should include multiple lessons and a comprehensive exercise section (a mix of multiple-choice quizzes and one-line questions). Each sub-module should have a title, a detailed content overview, an array of multiple lessons, and an array of exercises. Each lesson should have a title and extensive content (at least 200-300 words). Each exercise can be either a multiple-choice quiz question (with 4 options and one correct answer) or a one-line question (with a single correct answer). Ensure all IDs are unique strings.`;

    const response = await model.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              title: { type: Type.STRING },
              content: { type: Type.STRING },
              status: { type: Type.STRING, enum: ["locked", "unlocked", "completed"] },
              lessons: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    title: { type: Type.STRING },
                    content: { type: Type.STRING },
                  },
                  required: ["id", "title", "content"],
                },
              },
              exercises: {
                type: Type.ARRAY,
                items: {
                  oneOf: [
                    {
                      type: Type.OBJECT,
                      properties: {
                        id: { type: Type.STRING },
                        question: { type: Type.STRING },
                        options: { type: Type.ARRAY, items: { type: Type.STRING } },
                        correctAnswer: { type: Type.STRING },
                      },
                      required: ["id", "question", "options", "correctAnswer"],
                    },
                    {
                      type: Type.OBJECT,
                      properties: {
                        id: { type: Type.STRING },
                        question: { type: Type.STRING },
                        correctAnswer: { type: Type.STRING },
                      },
                      required: ["id", "question", "correctAnswer"],
                    },
                  ],
                },
              },
            },
            required: ["id", "title", "content", "lessons", "exercises", "status"],
          },
        },
        safetySettings,
      },
    });

    const jsonText = response.text.trim();
    const subModules: SubModule[] = JSON.parse(jsonText);
    // Ensure the first sub-module is unlocked
    if (subModules.length > 0) {
      subModules[0].status = 'unlocked';
    }
    return subModules;
  }

  async generateQuizForSubModule(subModuleContent: string): Promise<(QuizQuestion | OneLineQuestion)[]> {
    const prompt = `Based on the following extensive content, generate a mix of 3-5 multiple-choice questions (with 4 options and one correct answer) and 2-3 one-line questions (with a single correct answer). Ensure the questions cover key concepts from the content and require a good understanding.`;

    const response = await model.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            oneOf: [
              {
                properties: {
                  id: { type: Type.STRING },
                  question: { type: Type.STRING },
                  options: { type: Type.ARRAY, items: { type: Type.STRING } },
                  correctAnswer: { type: Type.STRING },
                },
                required: ["id", "question", "options", "correctAnswer"],
              },
              {
                properties: {
                  id: { type: Type.STRING },
                  question: { type: Type.STRING },
                  correctAnswer: { type: Type.STRING },
                },
                required: ["id", "question", "correctAnswer"],
              },
            ],
          },
        },
        safetySettings,
      },
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText);
  }

  async getChatResponse(chatHistory: any[], newMessage: string, currentModuleContext: string): Promise<string> {
    const chat = ai.chats.create({
      model: "gemini-2.5-flash-lite",
      config: {
        systemInstruction: `You are a helpful learning assistant. Your task is to answer questions based *only* on the provided module context and chat history. If the answer cannot be found in the context, state that clearly. Do not use any external knowledge. Here is the current module context:\n\n---\n${currentModuleContext}\n---`,
        maxOutputTokens: 2048,
      },
      history: chatHistory,
    });

    const response = await chat.sendMessage({ message: newMessage });
    return response.text;
  }
}

export default new LearnAnythingService();