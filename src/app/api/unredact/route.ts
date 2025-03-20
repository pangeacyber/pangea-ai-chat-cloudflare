import type { NextRequest } from "next/server";

import type { PangeaResponse, UnredactResult } from "@src/types";

import { getUrl, postRequest, validateToken } from "../requests";

const SERVICE_NAME = "redact";
const API_VERSION = "v1";

export interface RequestBody {
  /** Data to unredact */
  redacted_data: string;

  /** FPE context used to decrypt and unredact data */
  fpe_context: string;
}

export async function POST(request: NextRequest) {
  const { success: authenticated, username } = await validateToken(request);

  if (!(authenticated && username)) {
    return new Response("Forbidden", { status: 403 });
  }

  const body: RequestBody = await request.json();

  const endpoint = `${API_VERSION}/unredact`;
  const url = getUrl(SERVICE_NAME, endpoint);

  const {
    success,
    response,
  }: { success: boolean; response: PangeaResponse<UnredactResult> } =
    await postRequest(url, body);

  if (!success) {
    return new Response("Failed to unredact data", { status: 500 });
  }

  return Response.json(response);
}

export const runtime = "edge";
