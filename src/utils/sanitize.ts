import { JSDOM } from "jsdom";
import DOMPurify from "dompurify";

const window = new JSDOM("").window;
const purify = DOMPurify(window as unknown as any);

export function sanitizeInput(input: string): string {
  const trimmed = input.trim();
  return purify.sanitize(trimmed, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
}

export function sanitizeHtml(input: string): string {
  return purify.sanitize(input, {
    ALLOWED_TAGS: ["b", "i", "em", "strong", "p", "br", "ul", "ol", "li", "a", "h3", "h4"],
    ALLOWED_ATTR: ["href", "target", "rel"],
  });
}

export function escapeForRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
