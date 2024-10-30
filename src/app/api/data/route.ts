import type { NextRequest } from "next/server";

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

  const body: any = await request.json();

  const endpoint = `${API_VERSION}/text/guard`;
  const url = getUrl(SERVICE_NAME, endpoint);

  const { success, response } = await postRequest(url, body);

  if (success) {
    const auditLogData = {
      event: {
        event_input: body.text,
        event_output: JSON.stringify(response.result.redacted_prompt),
        event_type: "ai_guard",
        event_context: JSON.stringify({
          recipe: body.recipe,
        }),
        event_findings: JSON.stringify(response.result.findings),
        malicious_entity_count: response.result.findings?.malicious_count || 0,
        actor: username,
      },
    };

    try {
      await auditLogRequest(auditLogData);
    } catch (_) {}

    return new Response(JSON.stringify(response.result));
  } else {
    return new Response(JSON.stringify(response.result), { status: 400 });
  }
}
