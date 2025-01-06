import type { AIGuard } from "pangea-node-sdk";

export interface PangeaResponse<T = unknown> {
  request_id: string;
  request_time: string;
  response_time: string;
  status: string;
  summary: string;
  result: T;
}

export type AIGuardResultV1 = AIGuard.TextGuardResult;

export interface AIGuardDetector<T> {
  detected: boolean;
  data: T | null;
}
export interface AIGuardResultV2 {
  detectors: {
    prompt_injection: AIGuardDetector<{
      analyzer_responses: { analyzer: string; confidence: number }[];
    }>;
    pii_entity?: AIGuardDetector<{
      entities: { redacted: boolean }[];
    }>;
    malicious_entity?: AIGuardDetector<{
      entities: unknown[];
    }>;
  };
  prompt: string;
}

export type AIGuardResult = AIGuardResultV1 | AIGuardResultV2;
