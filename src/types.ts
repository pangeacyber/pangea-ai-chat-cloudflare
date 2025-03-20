import type { MessageFieldWithRole } from "@langchain/core/messages";

export interface PangeaResponse<T = unknown> {
  request_id: string;
  request_time: string;
  response_time: string;
  status: string;
  summary: string;
  result: T;
}

export interface AIGuardDetector<T> {
  detected: boolean;
  data: T | null;
}

export interface AIGuardResult {
  detectors: {
    prompt_injection: AIGuardDetector<{
      action: string;
      analyzer_responses: { analyzer: string; confidence: number }[];
    }>;
    pii_entity?: AIGuardDetector<{ entities: { action: string }[] }>;
    malicious_entity?: AIGuardDetector<{ entities: unknown[] }>;
    secrets_detection?: AIGuardDetector<{ entities: unknown[] }>;
    code_detection?: AIGuardDetector<{ language: string; action: string }>;
    language_detection?: AIGuardDetector<{ language: string; action: string }>;
  };
  prompt_text: string;
  prompt_messages: MessageFieldWithRole[];
  blocked: boolean;
  fpe_context?: string;
}

export interface Detector {
  name: string;
  description: string;
  enabled: boolean;
}

export interface DetectorOverrides {
  code_detection: { disabled?: boolean; action?: "report" | "block" };
  language_detection: { disabled?: boolean };
  prompt_injection: { disabled?: boolean; action?: "report" | "block" };
  malicious_entity: {
    disabled?: boolean;
    domain?: "report" | "defang" | "disabled" | "block";
    ip_address?: "report" | "defang" | "disabled" | "block";
    url?: "report" | "defang" | "disabled" | "block";
  };
  pii_entity: { disabled?: boolean };
  secrets_detection: { disabled?: boolean };
}

export interface UnredactResult {
  data: string;
}
