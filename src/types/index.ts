/** A phase in the U.S. presidential election process. */
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

/** A quiz question with multiple-choice options. */
export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  category: string;
}

/** A single message in a chat conversation. */
export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

/** A chat session containing the full conversation history. */
export interface ChatSession {
  id: string;
  messages: ChatMessage[];
  createdAt: number;
  lastActive: number;
}

/** The result of answering a single quiz question. */
export interface QuizResult {
  questionId: string;
  selectedIndex: number;
  correct: boolean;
  timeTaken: number;
}

/** A complete quiz session with questions, results, and scoring. */
export interface QuizSession {
  id: string;
  questions: QuizQuestion[];
  results: QuizResult[];
  score: number;
  totalQuestions: number;
  startedAt: number;
  completedAt?: number;
}

/** Standard API response wrapper used by all endpoints. */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: number;
}

/** Paginated API response with metadata. */
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  page: number;
  pageSize: number;
  total: number;
}

/** User progress tracking data. */
export interface ProgressData {
  phasesViewed: string[];
  quizzesCompleted: number;
  quizHighScore: number;
  chatMessagesCount: number;
  lastVisit: number;
}

/** A frequently asked question with categorization. */
export interface ElectionFAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  relatedPhaseIds: string[];
}

/** A glossary term with definition and cross-references. */
export interface GlossaryTerm {
  term: string;
  definition: string;
  relatedTerms: string[];
}
