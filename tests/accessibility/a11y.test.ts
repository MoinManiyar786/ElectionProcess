import * as fs from "fs";
import * as path from "path";

describe("Accessibility Tests", () => {
  let htmlContent: string;

  beforeAll(() => {
    htmlContent = fs.readFileSync(
      path.join(__dirname, "../../public/index.html"),
      "utf-8",
    );
  });

  describe("Document Structure", () => {
    it("should have a lang attribute on html element", () => {
      expect(htmlContent).toMatch(/<html[^>]*lang="en"/);
    });

    it("should have a dir attribute for text direction", () => {
      expect(htmlContent).toMatch(/<html[^>]*dir="ltr"/);
    });

    it("should have a proper title", () => {
      expect(htmlContent).toMatch(/<title>[^<]+<\/title>/);
    });

    it("should have a meta viewport tag", () => {
      expect(htmlContent).toMatch(
        /<meta\s+name="viewport"\s+content="width=device-width/,
      );
    });

    it("should have a meta description", () => {
      expect(htmlContent).toMatch(/<meta\s+name="description"/);
    });

    it("should have a meta charset", () => {
      expect(htmlContent).toMatch(/<meta\s+charset="UTF-8"/);
    });
  });

  describe("Landmarks", () => {
    it("should have a header with banner role", () => {
      expect(htmlContent).toMatch(/role="banner"/);
    });

    it("should have a main element with role", () => {
      expect(htmlContent).toMatch(/role="main"/);
    });

    it("should have a navigation element", () => {
      expect(htmlContent).toMatch(/role="navigation"/);
    });

    it("should have a footer with contentinfo role", () => {
      expect(htmlContent).toMatch(/role="contentinfo"/);
    });
  });

  describe("Navigation", () => {
    it("should have a skip-to-content link", () => {
      expect(htmlContent).toMatch(/class="skip-link"/);
      expect(htmlContent).toMatch(/href="#main-content"/);
    });

    it("should have aria-labels on navigation", () => {
      expect(htmlContent).toMatch(/aria-label="Main navigation"/);
    });

    it("should have aria-pressed on nav buttons", () => {
      expect(htmlContent).toMatch(/aria-pressed="true"/);
      expect(htmlContent).toMatch(/aria-pressed="false"/);
    });
  });

  describe("Forms", () => {
    it("should have labels for chat input", () => {
      expect(htmlContent).toMatch(/for="chat-input"/);
    });

    it("should have labels for glossary search", () => {
      expect(htmlContent).toMatch(/for="glossary-search"/);
    });

    it("should have aria-describedby on inputs", () => {
      expect(htmlContent).toMatch(/aria-describedby="chat-input-hint"/);
      expect(htmlContent).toMatch(/aria-describedby="glossary-search-hint"/);
    });

    it("should have autocomplete attributes", () => {
      expect(htmlContent).toMatch(/autocomplete="off"/);
    });

    it("should have maxlength on chat input", () => {
      expect(htmlContent).toMatch(/maxlength="1000"/);
    });
  });

  describe("ARIA Attributes", () => {
    it("should have aria-live region for announcements", () => {
      expect(htmlContent).toMatch(/aria-live="polite"/);
    });

    it("should have aria-labels on buttons", () => {
      expect(htmlContent).toMatch(/aria-label="Send message"/);
      expect(htmlContent).toMatch(/aria-label="Start the quiz"/);
    });

    it("should have aria-expanded on expandable elements", () => {
      expect(htmlContent).toMatch(/aria-expanded="false"/);
    });

    it("should have role attributes on interactive elements", () => {
      expect(htmlContent).toMatch(/role="log"/);
      expect(htmlContent).toMatch(/role="list"/);
      expect(htmlContent).toBeDefined();
      expect(htmlContent).toMatch(/role="progressbar"/);
      expect(htmlContent).toMatch(/role="radiogroup"/);
    });

    it("should have aria-hidden on decorative elements", () => {
      expect(htmlContent).toMatch(/aria-hidden="true"/);
    });

    it("should have role=status on loading indicators", () => {
      expect(htmlContent).toMatch(/role="status"/);
    });
  });

  describe("Headings", () => {
    it("should have an h1 element", () => {
      expect(htmlContent).toMatch(/<h1/);
    });

    it("should have h2 elements for sections", () => {
      const h2Matches = htmlContent.match(/<h2/g);
      expect(h2Matches).not.toBeNull();
      expect(h2Matches!.length).toBeGreaterThanOrEqual(4);
    });

    it("should have id attributes on headings for aria-labelledby", () => {
      expect(htmlContent).toMatch(/id="timeline-heading"/);
      expect(htmlContent).toMatch(/id="chat-heading"/);
      expect(htmlContent).toMatch(/id="quiz-heading"/);
      expect(htmlContent).toMatch(/id="faq-heading"/);
      expect(htmlContent).toMatch(/id="glossary-heading"/);
    });

    it("should have aria-labelledby on sections", () => {
      expect(htmlContent).toMatch(/aria-labelledby="timeline-heading"/);
      expect(htmlContent).toMatch(/aria-labelledby="chat-heading"/);
      expect(htmlContent).toMatch(/aria-labelledby="quiz-heading"/);
    });
  });

  describe("Screen Reader Support", () => {
    it("should have sr-only class for screen reader text", () => {
      expect(htmlContent).toMatch(/class="sr-only"/);
    });

    it("should have aria-atomic on live region", () => {
      expect(htmlContent).toMatch(/aria-atomic="true"/);
    });
  });

  describe("Links", () => {
    it("should have target and rel on external links", () => {
      expect(htmlContent).toMatch(/rel="noopener noreferrer"/);
      expect(htmlContent).toMatch(/target="_blank"/);
    });
  });
});

describe("CSS Accessibility", () => {
  let cssContent: string;

  beforeAll(() => {
    cssContent = fs.readFileSync(
      path.join(__dirname, "../../public/css/styles.css"),
      "utf-8",
    );
  });

  it("should have focus-visible styles", () => {
    expect(cssContent).toMatch(/:focus-visible/);
  });

  it("should have prefers-reduced-motion media query", () => {
    expect(cssContent).toMatch(/prefers-reduced-motion/);
  });

  it("should have prefers-color-scheme dark mode", () => {
    expect(cssContent).toMatch(/prefers-color-scheme:\s*dark/);
  });

  it("should have forced-colors (high contrast) support", () => {
    expect(cssContent).toMatch(/forced-colors:\s*active/);
  });

  it("should have skip-link styles", () => {
    expect(cssContent).toMatch(/\.skip-link/);
  });

  it("should have sr-only utility class", () => {
    expect(cssContent).toMatch(/\.sr-only/);
  });

  it("should have print styles", () => {
    expect(cssContent).toMatch(/@media\s+print/);
  });

  it("should use relative units for font sizes", () => {
    expect(cssContent).toMatch(/font-size:\s*\d+(\.\d+)?rem/);
  });
});
