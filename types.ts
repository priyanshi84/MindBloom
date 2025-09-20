export interface ConversationMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  attachment?: {
    data: string; // base64 encoded data
    mimeType: string;
  };
  timestamp: string;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  messages: ConversationMessage[];
}

export interface MoodEntry {
  id: string;
  date: string; // YYYY-MM-DD format
  level: number; // 1 to 5
  note: string; // User's journal entry
  photo?: string; // base64 encoded image string
  audio?: string; // base64 encoded audio data URL
}

export interface PracticeMessage {
  role: 'parent' | 'user';
  content: string;
  timestamp: string;
}

export enum Page {
  Today = 'TODAY',
  Chat = 'CHAT',
  Dashboard = 'DASHBOARD',
  Meditation = 'MEDITATION',
  Exam = 'EXAM',
  Family = 'FAMILY',
  CalmCanvas = 'CALM_CANVAS',
  Settings = 'SETTINGS',
}

export interface PageProps {
  setActivePage: (page: Page) => void;
}