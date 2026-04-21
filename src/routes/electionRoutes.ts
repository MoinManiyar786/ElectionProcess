import { Router, Request, Response } from "express";
import { getPhasesByOrder, getPhaseById } from "../data/electionPhases";
import { electionFAQs, searchFAQs, getFAQsByCategory } from "../data/faqs";
import { glossaryTerms, searchGlossary, getGlossaryTerm } from "../data/glossary";
import { phaseIdSchema } from "../utils/validation";
import { ApiResponse, ElectionPhase, ElectionFAQ, GlossaryTerm } from "../types";
import { logger } from "../utils/logger";

const router = Router();

router.get("/phases", (_req: Request, res: Response<ApiResponse<ElectionPhase[]>>) => {
  try {
    const phases = getPhasesByOrder();
    res.json({
      success: true,
      data: phases,
      timestamp: Date.now(),
    });
  } catch (error) {
    logger.error("Error fetching phases", { error });
    res.status(500).json({
      success: false,
      error: "Failed to fetch election phases",
      timestamp: Date.now(),
    });
  }
});

router.get("/phases/:id", (req: Request, res: Response<ApiResponse<ElectionPhase>>) => {
  try {
    const parsed = phaseIdSchema.safeParse(req.params);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        error: "Invalid phase ID",
        timestamp: Date.now(),
      });
      return;
    }

    const phase = getPhaseById(parsed.data.id);
    if (!phase) {
      res.status(404).json({
        success: false,
        error: "Election phase not found",
        timestamp: Date.now(),
      });
      return;
    }

    res.json({
      success: true,
      data: phase,
      timestamp: Date.now(),
    });
  } catch (error) {
    logger.error("Error fetching phase", { error, id: req.params["id"] });
    res.status(500).json({
      success: false,
      error: "Failed to fetch election phase",
      timestamp: Date.now(),
    });
  }
});

router.get("/faqs", (req: Request, res: Response<ApiResponse<ElectionFAQ[]>>) => {
  try {
    const query = req.query["q"] as string | undefined;
    const category = req.query["category"] as string | undefined;

    let faqs: ElectionFAQ[];
    if (query) {
      faqs = searchFAQs(query);
    } else if (category) {
      faqs = getFAQsByCategory(category);
    } else {
      faqs = electionFAQs;
    }

    res.json({
      success: true,
      data: faqs,
      timestamp: Date.now(),
    });
  } catch (error) {
    logger.error("Error fetching FAQs", { error });
    res.status(500).json({
      success: false,
      error: "Failed to fetch FAQs",
      timestamp: Date.now(),
    });
  }
});

router.get("/glossary", (req: Request, res: Response<ApiResponse<GlossaryTerm[]>>) => {
  try {
    const query = req.query["q"] as string | undefined;

    const terms = query ? searchGlossary(query) : glossaryTerms;

    res.json({
      success: true,
      data: terms,
      timestamp: Date.now(),
    });
  } catch (error) {
    logger.error("Error fetching glossary", { error });
    res.status(500).json({
      success: false,
      error: "Failed to fetch glossary",
      timestamp: Date.now(),
    });
  }
});

router.get("/glossary/:term", (req: Request, res: Response<ApiResponse<GlossaryTerm>>) => {
  try {
    const termParam = req.params["term"] as string;
    if (!termParam) {
      res.status(400).json({
        success: false,
        error: "Term parameter is required",
        timestamp: Date.now(),
      });
      return;
    }

    const term = getGlossaryTerm(termParam);
    if (!term) {
      res.status(404).json({
        success: false,
        error: "Glossary term not found",
        timestamp: Date.now(),
      });
      return;
    }

    res.json({
      success: true,
      data: term,
      timestamp: Date.now(),
    });
  } catch (error) {
    logger.error("Error fetching glossary term", { error });
    res.status(500).json({
      success: false,
      error: "Failed to fetch glossary term",
      timestamp: Date.now(),
    });
  }
});

export default router;
