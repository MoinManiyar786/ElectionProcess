import {
  chatMessageSchema,
  quizSubmissionSchema,
  paginationSchema,
  phaseIdSchema,
  quizFilterSchema,
} from "../../src/utils/validation";

describe("Validation Schemas", () => {
  describe("chatMessageSchema", () => {
    it("should accept a valid message", () => {
      const result = chatMessageSchema.safeParse({
        message: "How does the Electoral College work?",
      });
      expect(result.success).toBe(true);
    });

    it("should accept a message with sessionId", () => {
      const result = chatMessageSchema.safeParse({
        message: "Tell me more",
        sessionId: "550e8400-e29b-41d4-a716-446655440000",
      });
      expect(result.success).toBe(true);
    });

    it("should reject empty message", () => {
      const result = chatMessageSchema.safeParse({ message: "" });
      expect(result.success).toBe(false);
    });

    it("should reject message exceeding max length", () => {
      const result = chatMessageSchema.safeParse({
        message: "a".repeat(1001),
      });
      expect(result.success).toBe(false);
    });

    it("should trim whitespace", () => {
      const result = chatMessageSchema.safeParse({
        message: "  hello world  ",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.message).toBe("hello world");
      }
    });

    it("should reject invalid sessionId format", () => {
      const result = chatMessageSchema.safeParse({
        message: "hello",
        sessionId: "not-a-uuid",
      });
      expect(result.success).toBe(false);
    });

    it("should accept message without sessionId", () => {
      const result = chatMessageSchema.safeParse({ message: "hello" });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.sessionId).toBeUndefined();
      }
    });
  });

  describe("quizSubmissionSchema", () => {
    it("should accept a valid submission", () => {
      const result = quizSubmissionSchema.safeParse({
        questionId: "q1",
        selectedIndex: 2,
        timeTaken: 5000,
      });
      expect(result.success).toBe(true);
    });

    it("should reject selectedIndex out of range", () => {
      const result = quizSubmissionSchema.safeParse({
        questionId: "q1",
        selectedIndex: 5,
        timeTaken: 5000,
      });
      expect(result.success).toBe(false);
    });

    it("should reject negative selectedIndex", () => {
      const result = quizSubmissionSchema.safeParse({
        questionId: "q1",
        selectedIndex: -1,
        timeTaken: 5000,
      });
      expect(result.success).toBe(false);
    });

    it("should reject negative timeTaken", () => {
      const result = quizSubmissionSchema.safeParse({
        questionId: "q1",
        selectedIndex: 0,
        timeTaken: -100,
      });
      expect(result.success).toBe(false);
    });

    it("should reject missing questionId", () => {
      const result = quizSubmissionSchema.safeParse({
        selectedIndex: 0,
        timeTaken: 5000,
      });
      expect(result.success).toBe(false);
    });
  });

  describe("paginationSchema", () => {
    it("should accept valid pagination", () => {
      const result = paginationSchema.safeParse({ page: 1, pageSize: 10 });
      expect(result.success).toBe(true);
    });

    it("should use defaults when not provided", () => {
      const result = paginationSchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.pageSize).toBe(10);
      }
    });

    it("should reject page less than 1", () => {
      const result = paginationSchema.safeParse({ page: 0 });
      expect(result.success).toBe(false);
    });

    it("should reject pageSize greater than 50", () => {
      const result = paginationSchema.safeParse({ pageSize: 51 });
      expect(result.success).toBe(false);
    });

    it("should coerce string numbers", () => {
      const result = paginationSchema.safeParse({ page: "3", pageSize: "20" });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(3);
        expect(result.data.pageSize).toBe(20);
      }
    });
  });

  describe("phaseIdSchema", () => {
    it("should accept a valid phase ID", () => {
      const result = phaseIdSchema.safeParse({ id: "voter-registration" });
      expect(result.success).toBe(true);
    });

    it("should reject empty ID", () => {
      const result = phaseIdSchema.safeParse({ id: "" });
      expect(result.success).toBe(false);
    });

    it("should reject ID exceeding max length", () => {
      const result = phaseIdSchema.safeParse({ id: "a".repeat(51) });
      expect(result.success).toBe(false);
    });
  });

  describe("quizFilterSchema", () => {
    it("should accept valid filters", () => {
      const result = quizFilterSchema.safeParse({
        difficulty: "beginner",
        category: "electoral-college",
        count: 5,
      });
      expect(result.success).toBe(true);
    });

    it("should accept empty filters", () => {
      const result = quizFilterSchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.count).toBe(10);
      }
    });

    it("should reject invalid difficulty", () => {
      const result = quizFilterSchema.safeParse({ difficulty: "expert" });
      expect(result.success).toBe(false);
    });

    it("should reject count exceeding max", () => {
      const result = quizFilterSchema.safeParse({ count: 21 });
      expect(result.success).toBe(false);
    });
  });
});
