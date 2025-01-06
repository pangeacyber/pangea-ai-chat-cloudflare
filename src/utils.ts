import type { AIGuardResult, AIGuardResultV2 } from "./types";

export const delay = (time: number) => {
  return new Promise((resolve) => setTimeout(resolve, time));
};

export const rateLimitQuery = () => {
  const today = "24hour";

  const limitSearch = {
    query: "type:llm_response",
    limit: 1,
    start: today,
    search_restriction: {},
  };

  return limitSearch;
};

export const isAIGuardResultV2 = (x: AIGuardResult): x is AIGuardResultV2 => {
  return "detectors" in x;
};
