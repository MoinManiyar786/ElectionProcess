import request from "supertest";
import express from "express";
import { createApp } from "../../src/app";

let app: express.Application;

beforeAll(() => {
  process.env["NODE_ENV"] = "test";
  process.env["GOOGLE_AI_API_KEY"] = "test-api-key-for-testing";
  process.env["GOOGLE_CLOUD_API_KEY"] = "test-cloud-key-for-testing";
  app = createApp();
});

describe("API Integration Tests", () => {
  describe("GET /api/health", () => {
    it("should return healthy status", async () => {
      const res = await request(app).get("/api/health");
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe("healthy");
      expect(res.body.data.version).toBe("1.0.0");
      expect(res.body.data.uptime).toBeGreaterThanOrEqual(0);
      expect(res.body.timestamp).toBeDefined();
    });
  });

  describe("GET /api/election/phases", () => {
    it("should return all election phases", async () => {
      const res = await request(app).get("/api/election/phases");
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(8);
      expect(res.body.data[0].id).toBeTruthy();
      expect(res.body.data[0].title).toBeTruthy();
    });

    it("should return phases in order", async () => {
      const res = await request(app).get("/api/election/phases");
      const phases = res.body.data;
      for (let i = 1; i < phases.length; i++) {
        expect(phases[i].order).toBeGreaterThan(phases[i - 1].order);
      }
    });
  });

  describe("GET /api/election/phases/:id", () => {
    it("should return a specific phase", async () => {
      const res = await request(app).get("/api/election/phases/voter-registration");
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe("voter-registration");
      expect(res.body.data.title).toBe("Voter Registration");
    });

    it("should return 404 for non-existent phase", async () => {
      const res = await request(app).get("/api/election/phases/nonexistent");
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe("GET /api/election/faqs", () => {
    it("should return all FAQs", async () => {
      const res = await request(app).get("/api/election/faqs");
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it("should filter FAQs by category", async () => {
      const res = await request(app).get("/api/election/faqs?category=voter-registration");
      expect(res.status).toBe(200);
      res.body.data.forEach((faq: { category: string }) => {
        expect(faq.category).toBe("voter-registration");
      });
    });

    it("should search FAQs by query", async () => {
      const res = await request(app).get("/api/election/faqs?q=Electoral");
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
    });
  });

  describe("GET /api/election/glossary", () => {
    it("should return all glossary terms", async () => {
      const res = await request(app).get("/api/election/glossary");
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it("should search glossary terms", async () => {
      const res = await request(app).get("/api/election/glossary?q=ballot");
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
    });
  });

  describe("GET /api/election/glossary/:term", () => {
    it("should return a specific term", async () => {
      const res = await request(app).get("/api/election/glossary/Ballot");
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.term).toBe("Ballot");
    });

    it("should return 404 for non-existent term", async () => {
      const res = await request(app).get("/api/election/glossary/Nonexistent");
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe("POST /api/quiz/start", () => {
    it("should create a quiz session", async () => {
      const res = await request(app)
        .post("/api/quiz/start")
        .send({ count: 5 });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.sessionId).toBeTruthy();
      expect(res.body.data.questions).toHaveLength(5);
      expect(res.body.data.totalQuestions).toBe(5);
    });

    it("should not include correct answers in response", async () => {
      const res = await request(app)
        .post("/api/quiz/start")
        .send({ count: 3 });
      const question = res.body.data.questions[0];
      expect(question.correctIndex).toBeUndefined();
      expect(question.explanation).toBeUndefined();
    });

    it("should filter by difficulty", async () => {
      const res = await request(app)
        .post("/api/quiz/start")
        .send({ difficulty: "beginner", count: 20 });
      expect(res.status).toBe(201);
      res.body.data.questions.forEach((q: { difficulty: string }) => {
        expect(q.difficulty).toBe("beginner");
      });
    });
  });

  describe("POST /api/quiz/submit/:sessionId", () => {
    it("should accept a valid answer submission", async () => {
      const startRes = await request(app)
        .post("/api/quiz/start")
        .send({ count: 3 });
      const { sessionId, questions } = startRes.body.data;

      const res = await request(app)
        .post(`/api/quiz/submit/${sessionId}`)
        .send({
          questionId: questions[0].id,
          selectedIndex: 0,
          timeTaken: 5000,
        });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(typeof res.body.data.correct).toBe("boolean");
      expect(res.body.data.explanation).toBeTruthy();
    });

    it("should return 404 for non-existent session", async () => {
      const res = await request(app)
        .post("/api/quiz/submit/nonexistent-session")
        .send({
          questionId: "q1",
          selectedIndex: 0,
          timeTaken: 5000,
        });
      expect(res.status).toBe(404);
    });

    it("should reject invalid submission data", async () => {
      const startRes = await request(app)
        .post("/api/quiz/start")
        .send({ count: 3 });
      const { sessionId } = startRes.body.data;

      const res = await request(app)
        .post(`/api/quiz/submit/${sessionId}`)
        .send({
          questionId: "q1",
          selectedIndex: 10,
          timeTaken: 5000,
        });
      expect(res.status).toBe(400);
    });
  });

  describe("GET /api/quiz/results/:sessionId", () => {
    it("should return results for a quiz session", async () => {
      const startRes = await request(app)
        .post("/api/quiz/start")
        .send({ count: 2 });
      const { sessionId, questions } = startRes.body.data;

      for (const q of questions) {
        await request(app)
          .post(`/api/quiz/submit/${sessionId}`)
          .send({ questionId: q.id, selectedIndex: 0, timeTaken: 3000 });
      }

      const res = await request(app).get(`/api/quiz/results/${sessionId}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.percentage).toBeDefined();
      expect(res.body.data.grade).toBeDefined();
      expect(res.body.data.feedback).toBeTruthy();
    });
  });

  describe("GET /api/quiz/categories", () => {
    it("should return available categories and difficulties", async () => {
      const res = await request(app).get("/api/quiz/categories");
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.categories.length).toBeGreaterThan(0);
      expect(res.body.data.difficulties).toContain("beginner");
    });
  });

  describe("POST /api/chat/session", () => {
    it("should create a new chat session", async () => {
      const res = await request(app).post("/api/chat/session");
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.sessionId).toBeTruthy();
    });
  });

  describe("POST /api/chat/message", () => {
    it("should reject empty messages", async () => {
      const res = await request(app)
        .post("/api/chat/message")
        .send({ message: "" });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should reject messages exceeding max length", async () => {
      const res = await request(app)
        .post("/api/chat/message")
        .send({ message: "a".repeat(1001) });
      expect(res.status).toBe(400);
    });

    it("should reject invalid session ID format", async () => {
      const res = await request(app)
        .post("/api/chat/message")
        .send({ message: "hello", sessionId: "not-a-uuid" });
      expect(res.status).toBe(400);
    });
  });

  describe("Security Headers", () => {
    it("should include security headers", async () => {
      const res = await request(app).get("/api/health");
      expect(res.headers["x-content-type-options"]).toBe("nosniff");
      expect(res.headers["x-frame-options"]).toBe("DENY");
      expect(res.headers["content-security-policy"]).toBeTruthy();
    });

    it("should include HSTS header", async () => {
      const res = await request(app).get("/api/health");
      expect(res.headers["strict-transport-security"]).toBeTruthy();
    });

    it("should include X-Request-Id header", async () => {
      const res = await request(app).get("/api/health");
      expect(res.headers["x-request-id"]).toBeTruthy();
      expect(res.headers["x-request-id"]).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
      );
    });

    it("should not expose X-Powered-By header", async () => {
      const res = await request(app).get("/api/health");
      expect(res.headers["x-powered-by"]).toBeUndefined();
    });

    it("should include referrer-policy header", async () => {
      const res = await request(app).get("/api/health");
      expect(res.headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
    });

    it("should reject oversized request bodies", async () => {
      const largeBody = { message: "x".repeat(50000) };
      const res = await request(app)
        .post("/api/chat/message")
        .send(largeBody);
      expect(res.status).toBeGreaterThanOrEqual(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe("404 Handling", () => {
    it("should return 404 for non-existent API routes", async () => {
      const res = await request(app).get("/api/nonexistent");
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe("Resource not found");
    });
  });

  describe("Content-Type Handling", () => {
    it("should handle JSON body parsing", async () => {
      const res = await request(app)
        .post("/api/quiz/start")
        .set("Content-Type", "application/json")
        .send(JSON.stringify({ count: 3 }));
      expect(res.status).toBe(201);
    });
  });
});
