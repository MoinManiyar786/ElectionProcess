import { JSDOM } from "jsdom";
import DOMPurify from "dompurify";

const { window } = new JSDOM("");
const purify = DOMPurify(window);

/**
 * Sanitize user input by stripping all HTML tags and trimming whitespace.
 * Used for chat messages and search queries to prevent XSS attacks.
 */
export function sanitizeInput(input: string): string {
  const trimmed = input.trim();
  return purify.sanitize(trimmed, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
}

/**
 * Sanitize HTML content while preserving safe formatting tags.
 * Used for rendering assistant responses with basic formatting.
 */
export function sanitizeHtml(input: string): string {
  return purify.sanitize(input, {
    ALLOWED_TAGS: ["b", "i", "em", "strong", "p", "br", "ul", "ol", "li", "a", "h3", "h4"],
    ALLOWED_ATTR: ["href", "target", "rel"],
  });
}

/**
 * Escape special regex characters in a string for safe use in RegExp constructors.
 */
export function escapeForRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
