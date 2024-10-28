import type { NextRequest } from "next/server";

import {
  auditLogRequest,
  getUrl,
  postRequest,
  validateToken,
} from "../requests";

const SERVICE_NAME = "prompt-guard";
const API_VERSION = "v1beta";

export async function POST(request: NextRequest) {
  const { success: authenticated, username } = await validateToken(request);

  if (!(authenticated && username)) {
    return new Response("Forbidden", { status: 403 });
  }

  const body: any = await request.json();

  const endpoint = `${API_VERSION}/guard`;
  const url = getUrl(SERVICE_NAME, endpoint);

  const { success, response } = await postRequest(url, body);

  if (success) {
    const auditLogData = {
      event: {
        event_input: JSON.stringify(body.messages),
        event_output: JSON.stringify(response.result),
        event_type: "prompt_guard",
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
