
import { openDB } from 'idb';
import { LearningMaterial } from '../types';

const DB_NAME = 'intellistudy-db';
const STORE_NAME = 'spaces';
const DB_VERSION = 1;

export interface Space extends LearningMaterial {
  pdfFile?: File;
  documentText?: string;
  videoId?: string;
  videoTranscript?: string;
}

async function initDB() {
  const db = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
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
