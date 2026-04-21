import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { getConfig, APP_CONSTANTS } from "../config";
import { ChatMessage, ChatSession } from "../types";
import { InMemoryCache } from "../utils/cache";
import { sanitizeInput } from "../utils/sanitize";
import { logger } from "../utils/logger";
import { electionFAQs, searchFAQs } from "../data/faqs";
import { getPhaseById, getPhasesByOrder } from "../data/electionPhases";
import { getGlossaryTerm, searchGlossary } from "../data/glossary";
import { v4 as uuidv4 } from "uuid";

const SYSTEM_PROMPT = `You are an expert, non-partisan election education assistant. Your role is to help users understand the U.S. election process, timelines, and procedures in a clear, accurate, and engaging way.

Guidelines:
- Provide factual, non-partisan information about the election process
- Explain concepts in simple, accessible language suitable for all education levels
- When discussing laws or procedures, cite specific amendments, acts, or regulations
- If asked about specific candidates, policies, or partisan opinions, politely redirect to factual process information
- Encourage civic participation and voter education
- Clarify common misconceptions about the election process
- Keep responses concise but thorough (aim for 2-4 paragraphs)
- Use examples and analogies to make complex concepts relatable
- If you're unsure about something, say so rather than providing potentially inaccurate information

Topics you can help with:
- Voter registration and eligibility
- Primary elections and caucuses
- National conventions
- General election campaigns and debates
- Election Day procedures and voting methods
- The Electoral College
- Congressional certification of results
- Presidential inauguration and transition
- Campaign finance rules
- Voting rights history and amendments
- State-specific election procedures`;

const sessionStore = new Map<string, ChatSession>();
const responseCache = new InMemoryCache(APP_CONSTANTS.CACHE_TTL_MS);

function buildFallbackResponse(userMessage: string): string | null {
  const message = userMessage.toLowerCase().trim();

  if (/^(hi|hello|hey|good morning|good afternoon|good evening)\b/.test(message)) {
    return "Hello. I can explain voter registration, primaries, the Electoral College, Election Day, certification, and inauguration. Ask a specific election-process question and I’ll answer with factual, non-partisan information.";
  }

  if (message.includes("timeline") || message.includes("steps") || message.includes("process")) {
    const phases = getPhasesByOrder();
    const summary = phases.map((phase) => `${phase.order}. ${phase.title}`).join("\n");
    return `The U.S. presidential election process has ${phases.length} main phases:\n\n${summary}\n\nAsk about any step if you want more detail.`;
  }

  const matchedPhase = getPhasesByOrder().find(
    (phase) =>
      message.includes(phase.id.replace(/-/g, " ")) ||
      message.includes(phase.title.toLowerCase()),
  );
  if (matchedPhase) {
    return `${matchedPhase.title}: ${matchedPhase.description}\n\n${matchedPhase.details.slice(0, 3).map((detail) => `- ${detail}`).join("\n")}`;
  }

  const faqMatches = searchFAQs(userMessage);
  if (faqMatches.length > 0) {
    const faq = faqMatches[0];
    if (faq) {
      return `${faq.question}\n\n${faq.answer}`;
    }
  }

  const glossaryExactMatch = getGlossaryTerm(userMessage);
  if (glossaryExactMatch) {
    return `${glossaryExactMatch.term}: ${glossaryExactMatch.definition}`;
  }

  const glossaryMatches = searchGlossary(userMessage);
  if (glossaryMatches.length > 0) {
    const term = glossaryMatches[0];
    if (term) {
      return `${term.term}: ${term.definition}`;
    }
  }

  if (message.includes("register") || message.includes("vote")) {
    const registrationPhase = getPhaseById("voter-registration");
    if (registrationPhase) {
      return `${registrationPhase.title}: ${registrationPhase.description}\n\n${registrationPhase.details.slice(0, 3).map((detail) => `- ${detail}`).join("\n")}`;
    }

    const faq = electionFAQs[0];
    return faq ? faq.answer : null;
  }

  return null;
}

function appendMessagePair(session: ChatSession, userContent: string, assistantContent: string): void {
  const userMsg: ChatMessage = { role: "user", content: userContent, timestamp: Date.now() };
  const assistantMsg: ChatMessage = { role: "assistant", content: assistantContent, timestamp: Date.now() };
  session.messages.push(userMsg, assistantMsg);

  if (session.messages.length > APP_CONSTANTS.MAX_CHAT_HISTORY * 2) {
    session.messages = session.messages.slice(-APP_CONSTANTS.MAX_CHAT_HISTORY * 2);
  }

  session.lastActive = Date.now();
  sessionStore.set(session.id, session);
}

function getAIClient(): GoogleGenerativeAI {
  const config = getConfig();
  return new GoogleGenerativeAI(config.GOOGLE_AI_API_KEY);
}

function buildChatHistory(messages: ChatMessage[]): Array<{ role: string; parts: Array<{ text: string }> }> {
  return messages.map((msg) => ({
    role: msg.role === "assistant" ? "model" : "user",
    parts: [{ text: msg.content }],
  }));
}

export function createSession(): ChatSession {
  const session: ChatSession = {
    id: uuidv4(),
    messages: [],
    createdAt: Date.now(),
    lastActive: Date.now(),
  };
  sessionStore.set(session.id, session);
  return session;
}

export function getSession(sessionId: string): ChatSession | undefined {
  const session = sessionStore.get(sessionId);
  if (session && Date.now() - session.lastActive > APP_CONSTANTS.SESSION_EXPIRY_MS) {
    sessionStore.delete(sessionId);
    return undefined;
  }
  return session;
}

export async function sendMessage(
  sessionId: string | undefined,
  userMessage: string,
): Promise<{ response: string; sessionId: string }> {
  const sanitized = sanitizeInput(userMessage);

  if (!sanitized) {
    throw new Error("Message cannot be empty after sanitization");
  }

  let session: ChatSession;
  if (sessionId) {
    const existing = getSession(sessionId);
    if (!existing) {
      session = createSession();
    } else {
      session = existing;
    }
  } else {
    session = createSession();
  }

  const cacheKey = `chat:${sanitized.toLowerCase().slice(0, 200)}`;
  if (session.messages.length === 0) {
    const cached = responseCache.get<string>(cacheKey);
    if (cached) {
      appendMessagePair(session, sanitized, cached);
      return { response: cached, sessionId: session.id };
    }
  }

  const localFallback = buildFallbackResponse(sanitized);
  if (localFallback) {
    appendMessagePair(session, sanitized, localFallback);
    if (session.messages.length <= 2) {
      responseCache.set(cacheKey, localFallback);
    }
    return { response: localFallback, sessionId: session.id };
  }

  try {
    const genAI = getAIClient();
    const model = genAI.getGenerativeModel({
      model: APP_CONSTANTS.AI_MODEL,
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      ],
      generationConfig: {
        maxOutputTokens: APP_CONSTANTS.AI_MAX_TOKENS,
        temperature: APP_CONSTANTS.AI_TEMPERATURE,
      },
    });

    const chat = model.startChat({
      history: [
        { role: "user", parts: [{ text: "You are an election education assistant. Please follow these instructions for all responses." }] },
        { role: "model", parts: [{ text: "I understand. I'm ready to help users learn about the election process. I'll provide factual, non-partisan information about elections." }] },
        ...buildChatHistory(session.messages),
      ],
      systemInstruction: SYSTEM_PROMPT,
    });

    const result = await chat.sendMessage(sanitized);
    const response = result.response.text();
    appendMessagePair(session, sanitized, response);

    if (session.messages.length <= 2) {
      responseCache.set(cacheKey, response);
    }

    return { response, sessionId: session.id };
  } catch (error) {
    logger.error("AI service error", { error, sessionId: session.id });
    const degradedResponse = buildFallbackResponse(sanitized);
    if (degradedResponse) {
      const prefixedResponse = `The live AI service is unavailable right now, but I can still help with core election information.\n\n${degradedResponse}`;
      appendMessagePair(session, sanitized, prefixedResponse);
      return { response: prefixedResponse, sessionId: session.id };
    }
    throw new Error("The AI service is currently unavailable.");
  }
}

export function cleanupExpiredSessions(): number {
  const now = Date.now();
  let cleaned = 0;
  for (const [id, session] of sessionStore) {
    if (now - session.lastActive > APP_CONSTANTS.SESSION_EXPIRY_MS) {
      sessionStore.delete(id);
      cleaned++;
    }
  }
  return cleaned;
}

export function getSessionCount(): number {
  return sessionStore.size;
}

export { responseCache };
