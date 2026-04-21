import { electionFAQs, getFAQsByCategory, searchFAQs } from "../../src/data/faqs";

describe("FAQ Data", () => {
  describe("electionFAQs", () => {
    it("should contain at least 8 FAQs", () => {
      expect(electionFAQs.length).toBeGreaterThanOrEqual(8);
    });

    it("should have unique IDs", () => {
      const ids = electionFAQs.map((f) => f.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it("should have non-empty questions and answers", () => {
      electionFAQs.forEach((faq) => {
        expect(faq.question.length).toBeGreaterThan(10);
        expect(faq.answer.length).toBeGreaterThan(20);
      });
    });

    it("should have valid categories", () => {
      electionFAQs.forEach((faq) => {
        expect(faq.category).toBeTruthy();
      });
    });

    it("should have related phase IDs", () => {
      electionFAQs.forEach((faq) => {
        expect(faq.relatedPhaseIds.length).toBeGreaterThan(0);
      });
    });
  });

  describe("getFAQsByCategory", () => {
    it("should return FAQs for a valid category", () => {
      const faqs = getFAQsByCategory("voter-registration");
      expect(faqs.length).toBeGreaterThan(0);
      faqs.forEach((f) => expect(f.category).toBe("voter-registration"));
    });

    it("should return empty array for non-existent category", () => {
      expect(getFAQsByCategory("nonexistent")).toHaveLength(0);
    });
  });

  describe("searchFAQs", () => {
    it("should find FAQs by question content", () => {
      const results = searchFAQs("vote");
      expect(results.length).toBeGreaterThan(0);
    });

    it("should find FAQs by answer content", () => {
      const results = searchFAQs("Electoral College");
      expect(results.length).toBeGreaterThan(0);
    });

    it("should be case-insensitive", () => {
      const upper = searchFAQs("ELECTORAL");
      const lower = searchFAQs("electoral");
      expect(upper.length).toBe(lower.length);
    });

    it("should return empty for non-matching queries", () => {
      expect(searchFAQs("xyznonexistent")).toHaveLength(0);
    });
  });
});
