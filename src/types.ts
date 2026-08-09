export type Category = 'Exatas' | 'Humanas' | 'Tecnologia' | 'Idiomas' | 'Geral';

export type SRSStage = 'new' | 'learning' | 'mastered';

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  srsStage: SRSStage;
  nextReviewDays: number;
  lastReviewed: string | null;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number; // 0-based index
  explanation: string;
  timestampRef?: string;
}

export interface TimestampBookmark {
  time: string;       // "04:20"
  seconds: number;    // 260
  topic: string;
  summary: string;
}

export interface ClassLesson {
  id: string;
  youtubeUrl: string;
  youtubeId: string;
  title: string;
  channel: string;
  duration: string;
  category: Category;
  summary: string;
  keyTakeaways: string[];
  timestamps: TimestampBookmark[];
  flashcards: Flashcard[];
  quiz: QuizQuestion[];
  courseName?: string;
  createdAt: string;
  lastStudiedAt: string;
  progress: number; // 0 - 100
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'tutor';
  text: string;
  timestampRef?: string;
  secondsRef?: number;
  createdAt: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  iconName: string;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface UserGamification {
  streakDays: number;
  lastStudiedDate: string; // YYYY-MM-DD
  xp: number;
  level: number;
  achievements: Achievement[];
  totalFlashcardsMastered: number;
  totalQuizzesCompleted: number;
  totalMinutesFocused: number;
}

export interface PomodoroSettings {
  workDurationMinutes: number;
  breakDurationMinutes: number;
  longBreakDurationMinutes: number;
  autoStartBreak: boolean;
  autoStartWork: boolean;
}
