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

  const body: { messages: unknown[] } = await request.json();

  const endpoint = `${API_VERSION}/guard`;
  const url = getUrl(SERVICE_NAME, endpoint);

  const { success, response } = await postRequest(url, body);

  if (!success) {
    return Response.json(response, { status: 400 });
  }

  const auditLogData = {
    event: {
      input: JSON.stringify(body.messages),
      output: JSON.stringify(response.result),
      type: "prompt_guard",
      actor: username,
    },
  };

  try {
    await auditLogRequest(auditLogData);
  } catch (_) {}

  return Response.json(response.result);
}

export const runtime = "edge";
