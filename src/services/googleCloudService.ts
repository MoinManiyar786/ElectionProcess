import { getConfig } from "../config";
import { logger } from "../utils/logger";

const GOOGLE_CLOUD_BASE = "https://texttospeech.googleapis.com/v1";
const TRANSLATION_BASE = "https://translation.googleapis.com/language/translate/v2";
const NL_BASE = "https://language.googleapis.com/v1";

interface TTSApiResponse {
  audioContent: string;
}

interface TranslationApiTranslation {
  translatedText: string;
  detectedSourceLanguage?: string;
}

interface TranslationApiResponse {
  data: { translations: TranslationApiTranslation[] };
}

interface DetectionApiResponse {
  data: { detections: Array<Array<{ language: string; confidence: number }>> };
}

interface SentimentApiSentence {
  text: { content: string };
  sentiment: { score: number; magnitude: number };
}

interface SentimentApiResponse {
  documentSentiment: { score: number; magnitude: number };
  sentences: SentimentApiSentence[];
}

interface EntityApiEntity {
  name: string;
  type: string;
  salience: number;
}

interface EntityApiResponse {
  entities: EntityApiEntity[];
}

interface LanguageApiItem {
  language: string;
  name: string;
}

interface LanguagesApiResponse {
  data: { languages: LanguageApiItem[] };
}

interface VoiceApiItem {
  name: string;
  languageCodes: string[];
  ssmlGender: string;
}

interface VoicesApiResponse {
  voices: VoiceApiItem[];
}

export interface TextToSpeechRequest {
  text: string;
  languageCode?: string;
  voiceName?: string;
  ssmlGender?: "MALE" | "FEMALE" | "NEUTRAL";
  speakingRate?: number;
  pitch?: number;
}

export interface TextToSpeechResponse {
  audioContent: string;
  contentType: string;
}

export interface TranslationRequest {
  text: string;
  targetLanguage: string;
  sourceLanguage?: string;
}

export interface TranslationResponse {
  translatedText: string;
  detectedSourceLanguage?: string;
}

export interface SentimentResult {
  score: number;
  magnitude: number;
  sentences: Array<{
    text: string;
    sentiment: { score: number; magnitude: number };
  }>;
}

export interface EntityResult {
  entities: Array<{
    name: string;
    type: string;
    salience: number;
  }>;
}

export interface LanguageDetectionResult {
  language: string;
  confidence: number;
}

function getApiKey(): string {
  const config = getConfig();
  return config.GOOGLE_CLOUD_API_KEY;
}

/**
 * Synthesize text to speech using Google Cloud Text-to-Speech API.
 * Returns base64-encoded audio content.
 */
export async function synthesizeSpeech(request: TextToSpeechRequest): Promise<TextToSpeechResponse> {
  const apiKey = getApiKey();
  const url = `${GOOGLE_CLOUD_BASE}/text:synthesize?key=${apiKey}`;

  const body = {
    input: { text: request.text.slice(0, 5000) },
    voice: {
      languageCode: request.languageCode || "en-US",
      name: request.voiceName || "en-US-Neural2-C",
      ssmlGender: request.ssmlGender || "FEMALE",
    },
    audioConfig: {
      audioEncoding: "MP3",
      speakingRate: request.speakingRate || 1.0,
      pitch: request.pitch || 0,
      effectsProfileId: ["small-bluetooth-speaker-class-device"],
    },
  };

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.text();
    logger.error("Text-to-Speech API error", { status: response.status, error });
    throw new Error(`Text-to-Speech API failed: ${response.status}`);
  }

  const data: TTSApiResponse = await response.json() as TTSApiResponse;
  return {
    audioContent: data.audioContent,
    contentType: "audio/mpeg",
  };
}

/**
 * Translate text using Google Cloud Translation API.
 */
export async function translateText(request: TranslationRequest): Promise<TranslationResponse> {
  const apiKey = getApiKey();

  const params = new URLSearchParams({
    key: apiKey,
    q: request.text.slice(0, 5000),
    target: request.targetLanguage,
    format: "text",
  });

  if (request.sourceLanguage) {
    params.set("source", request.sourceLanguage);
  }

  const url = `${TRANSLATION_BASE}?${params.toString()}`;
  const response = await fetch(url, { method: "POST" });

  if (!response.ok) {
    const error = await response.text();
    logger.error("Translation API error", { status: response.status, error });
    throw new Error(`Translation API failed: ${response.status}`);
  }

  const data: TranslationApiResponse = await response.json() as TranslationApiResponse;
  const translation = data.data.translations[0];

  return {
    translatedText: translation ? translation.translatedText : "",
    detectedSourceLanguage: translation?.detectedSourceLanguage,
  };
}

/**
 * Detect the language of the given text using Google Cloud Translation API.
 */
export async function detectLanguage(text: string): Promise<LanguageDetectionResult> {
  const apiKey = getApiKey();

  const params = new URLSearchParams({
    key: apiKey,
    q: text.slice(0, 1000),
  });

  const url = `${TRANSLATION_BASE}/detect?${params.toString()}`;
  const response = await fetch(url, { method: "POST" });

  if (!response.ok) {
    const error = await response.text();
    logger.error("Language detection API error", { status: response.status, error });
    throw new Error(`Language detection failed: ${response.status}`);
  }

  const data: DetectionApiResponse = await response.json() as DetectionApiResponse;
  const detections = data.data.detections[0];
  const detection = detections ? detections[0] : undefined;

  return {
    language: detection?.language ?? "unknown",
    confidence: detection?.confidence ?? 0,
  };
}

/**
 * Analyze sentiment of text using Google Cloud Natural Language API.
 */
export async function analyzeSentiment(text: string): Promise<SentimentResult> {
  const apiKey = getApiKey();
  const url = `${NL_BASE}/documents:analyzeSentiment?key=${apiKey}`;

  const body = {
    document: {
      type: "PLAIN_TEXT",
      content: text.slice(0, 5000),
    },
    encodingType: "UTF8",
  };

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.text();
    logger.error("Sentiment analysis API error", { status: response.status, error });
    throw new Error(`Sentiment analysis failed: ${response.status}`);
  }

  const data: SentimentApiResponse = await response.json() as SentimentApiResponse;

  return {
    score: data.documentSentiment.score,
    magnitude: data.documentSentiment.magnitude,
    sentences: (data.sentences || []).map((s: SentimentApiSentence) => ({
      text: s.text.content,
      sentiment: {
        score: s.sentiment.score,
        magnitude: s.sentiment.magnitude,
      },
    })),
  };
}

/**
 * Analyze entities in text using Google Cloud Natural Language API.
 */
export async function analyzeEntities(text: string): Promise<EntityResult> {
  const apiKey = getApiKey();
  const url = `${NL_BASE}/documents:analyzeEntities?key=${apiKey}`;

  const body = {
    document: {
      type: "PLAIN_TEXT",
      content: text.slice(0, 5000),
    },
    encodingType: "UTF8",
  };

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.text();
    logger.error("Entity analysis API error", { status: response.status, error });
    throw new Error(`Entity analysis failed: ${response.status}`);
  }

  const data: EntityApiResponse = await response.json() as EntityApiResponse;

  return {
    entities: (data.entities || []).map((e: EntityApiEntity) => ({
      name: e.name,
      type: e.type,
      salience: e.salience,
    })),
  };
}

/**
 * Get supported languages for translation.
 */
export async function getSupportedLanguages(): Promise<Array<{ code: string; name: string }>> {
  const apiKey = getApiKey();
  const url = `${TRANSLATION_BASE}/languages?key=${apiKey}&target=en`;

  const response = await fetch(url);

  if (!response.ok) {
    logger.error("Get languages API error", { status: response.status });
    throw new Error(`Failed to get supported languages: ${response.status}`);
  }

  const data: LanguagesApiResponse = await response.json() as LanguagesApiResponse;
  return (data.data.languages || []).map((lang: LanguageApiItem) => ({
    code: lang.language,
    name: lang.name,
  }));
}

/**
 * List available TTS voices.
 */
export async function listVoices(languageCode?: string): Promise<Array<{ name: string; languageCodes: string[]; ssmlGender: string }>> {
  const apiKey = getApiKey();
  let url = `${GOOGLE_CLOUD_BASE}/voices?key=${apiKey}`;
  if (languageCode) {
    url += `&languageCode=${languageCode}`;
  }

  const response = await fetch(url);

  if (!response.ok) {
    logger.error("List voices API error", { status: response.status });
    throw new Error(`Failed to list voices: ${response.status}`);
  }

  const data: VoicesApiResponse = await response.json() as VoicesApiResponse;
  return (data.voices || []).map((v: VoiceApiItem) => ({
    name: v.name,
    languageCodes: v.languageCodes,
    ssmlGender: v.ssmlGender,
  }));
}
