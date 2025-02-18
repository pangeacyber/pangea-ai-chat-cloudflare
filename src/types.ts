import type { AIGuard } from "pangea-node-sdk";

export interface PangeaResponse<T = unknown> {
  request_id: string;
  request_time: string;
  response_time: string;
  status: string;
  summary: string;
  result: T;
}

export type AIGuardResult = AIGuard.TextGuardResult<unknown>;
