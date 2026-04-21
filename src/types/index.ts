export interface ElectionPhase {
  id: string;
  title: string;
  description: string;
  details: string[];
  timeline: string;
  order: number;
  icon: string;
  keyDates?: string[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  category: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

export interface ChatSession {
  id: string;
  messages: ChatMessage[];
  createdAt: number;
  lastActive: number;
}

export interface QuizResult {
  questionId: string;
  selectedIndex: number;
  correct: boolean;
  timeTaken: number;
}

export interface QuizSession {
  id: string;
  questions: QuizQuestion[];
  results: QuizResult[];
  score: number;
  totalQuestions: number;
  startedAt: number;
  completedAt?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: number;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  page: number;
  pageSize: number;
  total: number;
}

export interface ProgressData {
  phasesViewed: string[];
  quizzesCompleted: number;
  quizHighScore: number;
  chatMessagesCount: number;
  lastVisit: number;
}

export interface ElectionFAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  relatedPhaseIds: string[];
}

export interface GlossaryTerm {
  term: string;
  definition: string;
  relatedTerms: string[];
}
