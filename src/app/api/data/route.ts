import type { NextRequest } from "next/server";

import type { AIGuardResult, PangeaResponse } from "@src/types";
import { isAIGuardResultV2 } from "@src/utils";

import {
  auditLogRequest,
  getUrl,
  postRequest,
  validateToken,
} from "../requests";

const SERVICE_NAME = "ai-guard";
const API_VERSION = "v1beta";

export async function POST(request: NextRequest) {
  const { success: authenticated, username } = await validateToken(request);

  if (!(authenticated && username)) {
    return new Response("Forbidden", { status: 403 });
  }

  // biome-ignore lint/suspicious/noExplicitAny: TODO
  const body: any = await request.json();

  const endpoint = `${API_VERSION}/text/guard`;
  const url = getUrl(SERVICE_NAME, endpoint);

  const {
    success,
    response,
  }: { success: boolean; response: PangeaResponse<AIGuardResult> } =
    await postRequest(url, body);

  if (!success) {
    return Response.json(response, { status: 400 });
  }

  const auditLogData = {
    event: {
      input: body.text,
      output: JSON.stringify(
        isAIGuardResultV2(response.result)
          ? response.result.prompt
          : response.result.redacted_prompt,
      ),
      type: "ai_guard",
      context: JSON.stringify({
        recipe: body.recipe,
      }),
      findings: JSON.stringify(
        isAIGuardResultV2(response.result)
          ? response.result.detectors
          : response.result.findings,
      ),
      malicious_entity_count: isAIGuardResultV2(response.result)
        ? response.result.detectors.malicious_entity?.data?.entities?.length ||
          0
        : response.result.findings?.malicious_count || 0,
      actor: username,
    },
  };

  try {
    await auditLogRequest(auditLogData);
  } catch (_) {}

  return Response.json(response);
}

export const runtime = "edge";
