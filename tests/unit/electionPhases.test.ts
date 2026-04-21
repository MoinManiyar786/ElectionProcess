import { electionPhases, getPhaseById, getPhasesByOrder } from "../../src/data/electionPhases";

describe("Election Phases Data", () => {
  describe("electionPhases", () => {
    it("should contain all 8 election phases", () => {
      expect(electionPhases).toHaveLength(8);
    });

    it("should have unique IDs for all phases", () => {
      const ids = electionPhases.map((p) => p.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it("should have unique order numbers for all phases", () => {
      const orders = electionPhases.map((p) => p.order);
      const uniqueOrders = new Set(orders);
      expect(uniqueOrders.size).toBe(orders.length);
    });

    it("should have orders from 1 to 8", () => {
      const orders = electionPhases.map((p) => p.order).sort((a, b) => a - b);
      expect(orders).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    });

    it("should have required fields for each phase", () => {
      electionPhases.forEach((phase) => {
        expect(phase.id).toBeTruthy();
        expect(phase.title).toBeTruthy();
        expect(phase.description).toBeTruthy();
        expect(phase.details.length).toBeGreaterThan(0);
        expect(phase.timeline).toBeTruthy();
        expect(phase.icon).toBeTruthy();
        expect(typeof phase.order).toBe("number");
      });
    });

    it("should have non-empty detail arrays for all phases", () => {
      electionPhases.forEach((phase) => {
        expect(phase.details.length).toBeGreaterThanOrEqual(3);
        phase.details.forEach((detail) => {
          expect(detail.length).toBeGreaterThan(10);
        });
      });
    });

    it("should include voter-registration as the first phase", () => {
      const firstPhase = electionPhases.find((p) => p.order === 1);
      expect(firstPhase).toBeDefined();
      expect(firstPhase!.id).toBe("voter-registration");
    });

    it("should include inauguration as the last phase", () => {
      const lastPhase = electionPhases.find((p) => p.order === 8);
      expect(lastPhase).toBeDefined();
      expect(lastPhase!.id).toBe("inauguration");
    });
  });

  describe("getPhaseById", () => {
    it("should return the correct phase for a valid ID", () => {
      const phase = getPhaseById("voter-registration");
      expect(phase).toBeDefined();
      expect(phase!.title).toBe("Voter Registration");
    });

    it("should return undefined for an invalid ID", () => {
      const phase = getPhaseById("nonexistent-phase");
      expect(phase).toBeUndefined();
    });

    it("should return undefined for an empty string", () => {
      const phase = getPhaseById("");
      expect(phase).toBeUndefined();
    });

    it("should find all phases by their IDs", () => {
      const expectedIds = [
        "voter-registration",
        "candidate-nomination",
        "national-conventions",
        "general-campaign",
        "election-day",
        "electoral-college",
        "certification",
        "inauguration",
      ];

      expectedIds.forEach((id) => {
        const phase = getPhaseById(id);
        expect(phase).toBeDefined();
        expect(phase!.id).toBe(id);
      });
    });
  });

  describe("getPhasesByOrder", () => {
    it("should return phases sorted by order", () => {
      const ordered = getPhasesByOrder();
      for (let i = 1; i < ordered.length; i++) {
        expect(ordered[i]!.order).toBeGreaterThan(ordered[i - 1]!.order);
      }
    });

    it("should return all phases", () => {
      const ordered = getPhasesByOrder();
      expect(ordered).toHaveLength(electionPhases.length);
    });

    it("should not mutate the original array", () => {
      const original = [...electionPhases];
      getPhasesByOrder();
      expect(electionPhases).toEqual(original);
    });
  });
});
