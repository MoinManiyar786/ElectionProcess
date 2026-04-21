import { glossaryTerms, searchGlossary, getGlossaryTerm } from "../../src/data/glossary";

describe("Glossary Data", () => {
  describe("glossaryTerms", () => {
    it("should contain at least 10 terms", () => {
      expect(glossaryTerms.length).toBeGreaterThanOrEqual(10);
    });

    it("should have unique terms", () => {
      const terms = glossaryTerms.map((t) => t.term.toLowerCase());
      expect(new Set(terms).size).toBe(terms.length);
    });

    it("should have non-empty definitions", () => {
      glossaryTerms.forEach((t) => {
        expect(t.definition.length).toBeGreaterThan(20);
      });
    });

    it("should have related terms arrays", () => {
      glossaryTerms.forEach((t) => {
        expect(Array.isArray(t.relatedTerms)).toBe(true);
      });
    });
  });

  describe("searchGlossary", () => {
    it("should find terms by name", () => {
      const results = searchGlossary("Electoral");
      expect(results.length).toBeGreaterThan(0);
    });

    it("should find terms by definition content", () => {
      const results = searchGlossary("538 electors");
      expect(results.length).toBeGreaterThan(0);
    });

    it("should be case-insensitive", () => {
      const upper = searchGlossary("BALLOT");
      const lower = searchGlossary("ballot");
      expect(upper.length).toBe(lower.length);
    });

    it("should return empty for non-matching query", () => {
      const results = searchGlossary("xyznonexistent");
      expect(results).toHaveLength(0);
    });
  });

  describe("getGlossaryTerm", () => {
    it("should find a term by exact name", () => {
      const term = getGlossaryTerm("Ballot");
      expect(term).toBeDefined();
      expect(term!.term).toBe("Ballot");
    });

    it("should be case-insensitive", () => {
      const term = getGlossaryTerm("ballot");
      expect(term).toBeDefined();
    });

    it("should return undefined for non-existent term", () => {
      const term = getGlossaryTerm("Nonexistent");
      expect(term).toBeUndefined();
    });
  });
});
