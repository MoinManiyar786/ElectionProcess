import {
  createQuizSession,
  submitAnswer,
  getQuizResults,
  getQuizSession,
  getAvailableCategories,
  getAvailableDifficulties,
} from "../../src/services/quizService";

describe("Quiz Service", () => {
  describe("createQuizSession", () => {
    it("should create a session with default options", () => {
      const session = createQuizSession();
      expect(session.id).toBeTruthy();
      expect(session.questions.length).toBeGreaterThan(0);
      expect(session.questions.length).toBeLessThanOrEqual(10);
      expect(session.score).toBe(0);
      expect(session.results).toHaveLength(0);
      expect(session.startedAt).toBeLessThanOrEqual(Date.now());
      expect(session.completedAt).toBeUndefined();
    });

    it("should respect count option", () => {
      const session = createQuizSession({ count: 3 });
      expect(session.questions).toHaveLength(3);
      expect(session.totalQuestions).toBe(3);
    });

    it("should filter by difficulty", () => {
      const session = createQuizSession({ difficulty: "beginner", count: 20 });
      session.questions.forEach((q) => {
        expect(q.difficulty).toBe("beginner");
      });
    });

    it("should filter by category", () => {
      const session = createQuizSession({ category: "electoral-college", count: 20 });
      session.questions.forEach((q) => {
        expect(q.category).toBe("electoral-college");
      });
    });

    it("should throw if no questions match filters", () => {
      expect(() => {
        createQuizSession({ category: "nonexistent-category" });
      }).toThrow("No questions available matching the specified filters");
    });
  });

  describe("getQuizSession", () => {
    it("should retrieve an existing session", () => {
      const created = createQuizSession({ count: 3 });
      const fetched = getQuizSession(created.id);
      expect(fetched).toBeDefined();
      expect(fetched!.id).toBe(created.id);
    });

    it("should return undefined for non-existent session", () => {
      expect(getQuizSession("nonexistent-id")).toBeUndefined();
    });
  });

  describe("submitAnswer", () => {
    it("should record a correct answer", () => {
      const session = createQuizSession({ count: 3 });
      const question = session.questions[0]!;
      const correctIndex = question.correctIndex;

      const result = submitAnswer(session.id, question.id, correctIndex, 5000);
      expect(result.correct).toBe(true);
      expect(result.score).toBe(1);
      expect(result.explanation).toBe(question.explanation);
    });

    it("should record an incorrect answer", () => {
      const session = createQuizSession({ count: 3 });
      const question = session.questions[0]!;
      const wrongIndex = (question.correctIndex + 1) % 4;

      const result = submitAnswer(session.id, question.id, wrongIndex, 5000);
      expect(result.correct).toBe(false);
      expect(result.score).toBe(0);
    });

    it("should throw for non-existent session", () => {
      expect(() => {
        submitAnswer("nonexistent", "q1", 0, 5000);
      }).toThrow("Quiz session not found");
    });

    it("should throw for duplicate answer", () => {
      const session = createQuizSession({ count: 3 });
      const question = session.questions[0]!;

      submitAnswer(session.id, question.id, 0, 5000);

      expect(() => {
        submitAnswer(session.id, question.id, 1, 5000);
      }).toThrow("Question already answered");
    });

    it("should throw for non-existent question in session", () => {
      const session = createQuizSession({ count: 3 });

      expect(() => {
        submitAnswer(session.id, "nonexistent-q", 0, 5000);
      }).toThrow("Question not found in this quiz session");
    });

    it("should mark session as completed when all questions answered", () => {
      const session = createQuizSession({ count: 2 });

      submitAnswer(session.id, session.questions[0]!.id, 0, 1000);
      submitAnswer(session.id, session.questions[1]!.id, 0, 1000);

      const completed = getQuizSession(session.id);
      expect(completed!.completedAt).toBeDefined();
    });

    it("should throw when submitting to completed session", () => {
      const session = createQuizSession({ count: 1 });
      submitAnswer(session.id, session.questions[0]!.id, 0, 1000);

      expect(() => {
        submitAnswer(session.id, "any-id", 0, 1000);
      }).toThrow("Quiz session already completed");
    });
  });

  describe("getQuizResults", () => {
    it("should return results for a session", () => {
      const session = createQuizSession({ count: 3 });
      session.questions.forEach((q) => {
        submitAnswer(session.id, q.id, q.correctIndex, 3000);
      });

      const results = getQuizResults(session.id);
      expect(results.percentage).toBe(100);
      expect(results.grade).toBe("A");
      expect(results.session.score).toBe(3);
    });

    it("should return correct grade for 0% score", () => {
      const session = createQuizSession({ count: 2 });
      session.questions.forEach((q) => {
        const wrongIndex = (q.correctIndex + 1) % 4;
        submitAnswer(session.id, q.id, wrongIndex, 3000);
      });

      const results = getQuizResults(session.id);
      expect(results.percentage).toBe(0);
      expect(results.grade).toBe("F");
    });

    it("should throw for non-existent session", () => {
      expect(() => {
        getQuizResults("nonexistent");
      }).toThrow("Quiz session not found");
    });

    it("should calculate percentage correctly", () => {
      const session = createQuizSession({ count: 4 });
      submitAnswer(session.id, session.questions[0]!.id, session.questions[0]!.correctIndex, 1000);
      submitAnswer(session.id, session.questions[1]!.id, session.questions[1]!.correctIndex, 1000);
      submitAnswer(session.id, session.questions[2]!.id, (session.questions[2]!.correctIndex + 1) % 4, 1000);
      submitAnswer(session.id, session.questions[3]!.id, (session.questions[3]!.correctIndex + 1) % 4, 1000);

      const results = getQuizResults(session.id);
      expect(results.percentage).toBe(50);
    });
  });

  describe("getAvailableCategories", () => {
    it("should return an array of categories", () => {
      const categories = getAvailableCategories();
      expect(categories.length).toBeGreaterThan(0);
      expect(categories).toContain("electoral-college");
    });

    it("should return unique categories", () => {
      const categories = getAvailableCategories();
      expect(new Set(categories).size).toBe(categories.length);
    });
  });

  describe("getAvailableDifficulties", () => {
    it("should return all difficulty levels", () => {
      const difficulties = getAvailableDifficulties();
      expect(difficulties).toContain("beginner");
      expect(difficulties).toContain("intermediate");
      expect(difficulties).toContain("advanced");
    });
  });
});
