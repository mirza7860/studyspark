
export type ViewMode = 'chat' | 'quiz' | 'flashcards' | 'summary';

export interface ChatMessage {
    role: 'user' | 'model';
    text: string;
}

export type Json = | string | number | boolean | null | { [key: string]: Json } | Json[];

export type ModuleStatus = 'locked' | 'unlocked' | 'completed';
export type SubModuleStatus = 'locked' | 'unlocked' | 'completed';

export interface LearningModule {
  id: string;
  title: string;
  description: string;
  subModules: SubModule[];
  status: ModuleStatus;
}

export interface SubModule {
  id: string;
  title: string;
  content: string;
  lessons: Lesson[];
  exercises: Exercise[];
  status: SubModuleStatus;
}

export interface Lesson {
  id: string;
  title: string;
  content: string;
}

export type Exercise = QuizQuestion | OneLineQuestion;

export interface OneLineQuestion {
  id: string;
  question: string;
  correctAnswer: string;
  userAnswer?: string;
  isCorrect?: boolean;
}

export interface QuizQuestion {
    question: string;
    options: string[];
    correctAnswer: string;
}

export interface Flashcard {
    term: string;
    definition: string;
}

export type LearningMaterialType = 'pdf' | 'youtube';

export interface LearningMaterial {
    id: string;
    type: LearningMaterialType;
    title: string;
    lastAccessed: string; // ISO date string
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          avatar_url: string | null;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          avatar_url?: string | null;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          avatar_url?: string | null;
        };
      };
      spaces: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          created_at: string;
          document_url: string | null;
          video_url: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          created_at?: string;
          document_url?: string | null;
          video_url?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          created_at?: string;
          document_url?: string | null;
          video_url?: string | null;
        };
      };
      chats: {
        Row: {
          id: string;
          space_id: string;
          user_id: string;
          message: string;
          is_user_message: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          space_id: string;
          user_id: string;
          message: string;
          is_user_message: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          space_id?: string;
          user_id?: string;
          message?: string;
          is_user_message?: boolean;
          created_at?: string;
        };
      };
      quizzes: {
        Row: {
          id: string;
          space_id: string;
          user_id: string;
          quiz_data: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          space_id: string;
          user_id: string;
          quiz_data: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          space_id?: string;
          user_id?: string;
          quiz_data?: Json;
          created_at?: string;
        };
      };
      flashcards: {
        Row: {
          id: string;
          space_id: string;
          user_id: string;
          flashcard_data: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          space_id: string;
          user_id: string;
          flashcard_data: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          space_id?: string;
          user_id?: string;
          flashcard_data?: Json;
          created_at?: string;
        };
      };
      summaries: {
        Row: {
          id: string;
          space_id: string;
          user_id: string;
          summary_data: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          space_id: string;
          user_id: string;
          summary_data: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          space_id?: string;
          user_id?: string;
          summary_data?: string;
          created_at?: string;
        };
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
}

