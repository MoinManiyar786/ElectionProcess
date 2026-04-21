import {
  quizQuestions,
  getQuestionsByDifficulty,
  getQuestionsByCategory,
  getRandomQuestions,
} from "../../src/data/quizQuestions";

describe("Quiz Questions Data", () => {
  describe("quizQuestions", () => {
    it("should contain at least 15 questions", () => {
      expect(quizQuestions.length).toBeGreaterThanOrEqual(15);
    });

    it("should have unique IDs", () => {
      const ids = quizQuestions.map((q) => q.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it("should have valid difficulty levels", () => {
      const validDifficulties = ["beginner", "intermediate", "advanced"];
      quizQuestions.forEach((q) => {
        expect(validDifficulties).toContain(q.difficulty);
      });
    });

    it("should have exactly 4 options per question", () => {
      quizQuestions.forEach((q) => {
        expect(q.options).toHaveLength(4);
      });
    });

    it("should have valid correctIndex (0-3)", () => {
      quizQuestions.forEach((q) => {
        expect(q.correctIndex).toBeGreaterThanOrEqual(0);
        expect(q.correctIndex).toBeLessThanOrEqual(3);
      });
    });

    it("should have non-empty explanations", () => {
      quizQuestions.forEach((q) => {
        expect(q.explanation.length).toBeGreaterThan(20);
      });
    });

    it("should have non-empty questions", () => {
      quizQuestions.forEach((q) => {
        expect(q.question.length).toBeGreaterThan(10);
      });
    });

    it("should have non-empty categories", () => {
      quizQuestions.forEach((q) => {
        expect(q.category).toBeTruthy();
      });
    });

    it("should cover all difficulty levels", () => {
      const difficulties = new Set(quizQuestions.map((q) => q.difficulty));
      expect(difficulties.has("beginner")).toBe(true);
      expect(difficulties.has("intermediate")).toBe(true);
      expect(difficulties.has("advanced")).toBe(true);
    });

    it("should have non-duplicate options within each question", () => {
      quizQuestions.forEach((q) => {
        const uniqueOptions = new Set(q.options);
        expect(uniqueOptions.size).toBe(4);
      });
    });
  });

  describe("getQuestionsByDifficulty", () => {
    it("should return only beginner questions", () => {
      const questions = getQuestionsByDifficulty("beginner");
      expect(questions.length).toBeGreaterThan(0);
      questions.forEach((q) => expect(q.difficulty).toBe("beginner"));
    });

    it("should return only intermediate questions", () => {
      const questions = getQuestionsByDifficulty("intermediate");
      expect(questions.length).toBeGreaterThan(0);
      questions.forEach((q) => expect(q.difficulty).toBe("intermediate"));
    });

    it("should return only advanced questions", () => {
      const questions = getQuestionsByDifficulty("advanced");
      expect(questions.length).toBeGreaterThan(0);
      questions.forEach((q) => expect(q.difficulty).toBe("advanced"));
    });
  });

  describe("getQuestionsByCategory", () => {
    it("should return questions for a valid category", () => {
      const questions = getQuestionsByCategory("electoral-college");
      expect(questions.length).toBeGreaterThan(0);
      questions.forEach((q) => expect(q.category).toBe("electoral-college"));
    });

    it("should return empty array for non-existent category", () => {
      const questions = getQuestionsByCategory("nonexistent");
      expect(questions).toHaveLength(0);
    });
  });

  describe("getRandomQuestions", () => {
    it("should return the requested number of questions", () => {
      const questions = getRandomQuestions(5);
      expect(questions).toHaveLength(5);
    });

    it("should not return more than available questions", () => {
      const questions = getRandomQuestions(1000);
      expect(questions.length).toBeLessThanOrEqual(quizQuestions.length);
    });

    it("should respect difficulty filter", () => {
      const questions = getRandomQuestions(5, { difficulty: "beginner" });
      questions.forEach((q) => expect(q.difficulty).toBe("beginner"));
    });

    it("should respect category filter", () => {
      const questions = getRandomQuestions(5, { category: "electoral-college" });
      questions.forEach((q) => expect(q.category).toBe("electoral-college"));
    });

    it("should return unique questions", () => {
      const questions = getRandomQuestions(10);
      const ids = questions.map((q) => q.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it("should handle combined filters", () => {
      const questions = getRandomQuestions(5, {
        difficulty: "intermediate",
        category: "electoral-college",
      });
      questions.forEach((q) => {
        expect(q.difficulty).toBe("intermediate");
        expect(q.category).toBe("electoral-college");
      });
    });
  });
});
