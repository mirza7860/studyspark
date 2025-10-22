
import { openDB } from 'idb';
import { LearningMaterial, LearningModule, ChatMessage } from '../types';

const DB_NAME = 'intellistudy-db';
const STORE_NAME = 'spaces';
const LEARN_ANYTHING_STORE_NAME = 'learnAnything';
const DB_VERSION = 2;

export interface Space extends LearningMaterial {
  pdfFile?: File;
  documentText?: string;
  videoId?: string;
  videoTranscript?: string;
}

export interface LearnAnythingData {
  id: string;
  topic: string;
  modules: LearningModule[];
  chatHistory: ChatMessage[];
  userAnswers: { [key: string]: string };
  lastAccessed: string;
}

async function initDB() {
  const db = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(LEARN_ANYTHING_STORE_NAME)) {
        db.createObjectStore(LEARN_ANYTHING_STORE_NAME, { keyPath: 'id' });
      }
    },
  });
  return db;
}

export async function addSpace(space: Omit<Space, 'id' | 'lastAccessed'>): Promise<Space> {
  const db = await initDB();
  const id = new Date().toISOString();
  const newSpace: Space = {
    ...space,
    id,
    lastAccessed: id,
  };
  await db.add(STORE_NAME, newSpace);
  return newSpace;
}

export async function getAllSpaces(): Promise<LearningMaterial[]> {
  const db = await initDB();
  return db.getAll(STORE_NAME);
}

export async function getSpace(id: string): Promise<Space | undefined> {
  const db = await initDB();
  return db.get(STORE_NAME, id);
}

export async function deleteSpace(id: string): Promise<void> {
  const db = await initDB();
  return db.delete(STORE_NAME, id);
}

export async function addLearningContent(data: Omit<LearnAnythingData, 'id' | 'lastAccessed'>): Promise<LearnAnythingData> {
  const db = await initDB();
  const id = new Date().toISOString();
  const newLearningContent: LearnAnythingData = {
    ...data,
    id,
    lastAccessed: id,
  };
  await db.add(LEARN_ANYTHING_STORE_NAME, newLearningContent);
  return newLearningContent;
}

export async function getLearningContent(id: string): Promise<LearnAnythingData | undefined> {
  const db = await initDB();
  return db.get(LEARN_ANYTHING_STORE_NAME, id);
}

export async function updateLearningContent(data: LearnAnythingData): Promise<LearnAnythingData> {
  const db = await initDB();
  const updatedData = { ...data, lastAccessed: new Date().toISOString() };
  await db.put(LEARN_ANYTHING_STORE_NAME, updatedData);
  return updatedData;
}

export async function getAllLearningContent(): Promise<LearnAnythingData[]> {
  const db = await initDB();
  return db.getAll(LEARN_ANYTHING_STORE_NAME);
}
