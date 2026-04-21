import { sanitizeInput, sanitizeHtml, escapeForRegex } from "../../src/utils/sanitize";

describe("Sanitization Utilities", () => {
  describe("sanitizeInput", () => {
    it("should return plain text unchanged", () => {
      expect(sanitizeInput("Hello world")).toBe("Hello world");
    });

    it("should strip HTML tags", () => {
      expect(sanitizeInput("<script>alert('xss')</script>")).toBe("");
    });

    it("should strip dangerous attributes", () => {
      expect(sanitizeInput('<img onerror="alert(1)" src="x">')).toBe("");
    });

    it("should trim whitespace", () => {
      expect(sanitizeInput("  hello  ")).toBe("hello");
    });

    it("should handle empty strings", () => {
      expect(sanitizeInput("")).toBe("");
    });

    it("should handle strings with only whitespace", () => {
      expect(sanitizeInput("   ")).toBe("");
    });

    it("should preserve normal special characters", () => {
      expect(sanitizeInput("What's the 270 vote threshold?")).toBe(
        "What's the 270 vote threshold?"
      );
    });

    it("should strip nested script tags", () => {
      expect(sanitizeInput("<div><script>alert(1)</script></div>")).toBe("");
    });

    it("should strip event handlers", () => {
      expect(sanitizeInput('<div onmouseover="alert(1)">text</div>')).toBe("text");
    });
  });

  describe("sanitizeHtml", () => {
    it("should allow safe tags", () => {
      const input = "<p>Hello <strong>world</strong></p>";
      expect(sanitizeHtml(input)).toContain("<p>");
      expect(sanitizeHtml(input)).toContain("<strong>");
    });

    it("should strip script tags", () => {
      expect(sanitizeHtml("<script>alert(1)</script>")).toBe("");
    });

    it("should allow anchor tags with href", () => {
      const input = '<a href="https://vote.gov" target="_blank">Vote</a>';
      const result = sanitizeHtml(input);
      expect(result).toContain("href");
      expect(result).toContain("Vote");
    });

    it("should strip dangerous attributes", () => {
      const input = '<p onclick="alert(1)">text</p>';
      const result = sanitizeHtml(input);
      expect(result).not.toContain("onclick");
      expect(result).toContain("text");
    });
  });

  describe("escapeForRegex", () => {
    it("should escape special regex characters", () => {
      expect(escapeForRegex("hello.world")).toBe("hello\\.world");
      expect(escapeForRegex("price ($)")).toBe("price \\(\\$\\)");
      expect(escapeForRegex("a+b*c?")).toBe("a\\+b\\*c\\?");
    });

    it("should return plain strings unchanged", () => {
      expect(escapeForRegex("hello")).toBe("hello");
    });

    it("should handle empty strings", () => {
      expect(escapeForRegex("")).toBe("");
    });
  });
});
