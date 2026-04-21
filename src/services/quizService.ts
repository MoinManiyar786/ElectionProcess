import { QuizQuestion, QuizSession, QuizResult } from "../types";
import { getRandomQuestions, quizQuestions } from "../data/quizQuestions";
import { v4 as uuidv4 } from "uuid";

const quizSessions = new Map<string, QuizSession>();

export function createQuizSession(options?: {
  difficulty?: QuizQuestion["difficulty"];
  category?: string;
  count?: number;
}): QuizSession {
  const count = options?.count ?? 10;
  const questions = getRandomQuestions(count, {
    difficulty: options?.difficulty,
    category: options?.category,
  });

  if (questions.length === 0) {
    throw new Error("No questions available matching the specified filters");
  }

  const session: QuizSession = {
    id: uuidv4(),
    questions,
    results: [],
    score: 0,
    totalQuestions: questions.length,
    startedAt: Date.now(),
  };

  quizSessions.set(session.id, session);
  return session;
}

export function getQuizSession(sessionId: string): QuizSession | undefined {
  return quizSessions.get(sessionId);
}

export function submitAnswer(
  sessionId: string,
  questionId: string,
  selectedIndex: number,
  timeTaken: number,
): { correct: boolean; explanation: string; correctIndex: number; score: number } {
  const session = quizSessions.get(sessionId);
  if (!session) {
    throw new Error("Quiz session not found");
  }

  if (session.completedAt) {
    throw new Error("Quiz session already completed");
  }

  const question = session.questions.find((q) => q.id === questionId);
  if (!question) {
    throw new Error("Question not found in this quiz session");
  }

  const alreadyAnswered = session.results.some((r) => r.questionId === questionId);
  if (alreadyAnswered) {
    throw new Error("Question already answered");
  }

  const correct = selectedIndex === question.correctIndex;
  const result: QuizResult = {
    questionId,
    selectedIndex,
    correct,
    timeTaken,
  };

  session.results.push(result);
  if (correct) {
    session.score++;
  }

  if (session.results.length === session.totalQuestions) {
    session.completedAt = Date.now();
  }

  quizSessions.set(sessionId, session);

  return {
    correct,
    explanation: question.explanation,
    correctIndex: question.correctIndex,
    score: session.score,
  };
}

export function getQuizResults(sessionId: string): {
  session: QuizSession;
  percentage: number;
  grade: string;
  feedback: string;
} {
  const session = quizSessions.get(sessionId);
  if (!session) {
    throw new Error("Quiz session not found");
  }

  const percentage =
    session.totalQuestions > 0
      ? Math.round((session.score / session.totalQuestions) * 100)
      : 0;

  let grade: string;
  let feedback: string;

  if (percentage >= 90) {
    grade = "A";
    feedback = "Excellent! You have an outstanding understanding of the election process!";
  } else if (percentage >= 80) {
    grade = "B";
    feedback = "Great job! You have a strong grasp of election concepts.";
  } else if (percentage >= 70) {
    grade = "C";
    feedback = "Good effort! Review the explanations to strengthen your knowledge.";
  } else if (percentage >= 60) {
    grade = "D";
    feedback = "Keep learning! Try exploring the election phases for more details.";
  } else {
    grade = "F";
    feedback = "Don't give up! Start with the election timeline to build your foundation.";
  }

  return { session, percentage, grade, feedback };
}

export function getAvailableCategories(): string[] {
  return [...new Set(quizQuestions.map((q) => q.category))];
}

export function getAvailableDifficulties(): QuizQuestion["difficulty"][] {
  return [...new Set(quizQuestions.map((q) => q.difficulty))];
}
