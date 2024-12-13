import type { NextRequest } from "next/server";

import { delay } from "@src/utils";
import type { Audit } from "pangea-node-sdk";

export interface ResponseObject<M> {
  request_id: string;
  request_time: string;
  response_time: string;
  status: string;
  result: M;
  summary: string;
}

type ValidatedToken =
  | { success: true; username: string; profile: Record<string, string> }
  | { success: false; username: undefined; profile: undefined };

const BEARER_RE = /^bearer/i;

export async function validateToken(
  request: NextRequest,
): Promise<ValidatedToken> {
  const auth = request.headers.get("Authorization");
  const token = auth?.match(BEARER_RE) ? auth.split(" ")[1] : "";

  if (!token) {
    return { success: false, username: undefined, profile: undefined };
  }

  const url = getUrl("authn", "v2/client/token/check");
  const body = { token };

  const { success, response } = await postRequest<{
    owner: string;
    profile: Record<string, string>;
  }>(url, body, true);

  if (!success) {
    return { success: false, username: undefined, profile: undefined };
  }

  return {
    success,
    username: response.result.owner,
    profile: response.result.profile,
  };
}

export async function auditLogRequest(data: { event: Record<string, string> }) {
  const url = getUrl("audit", "v1/log");
  const now = new Date();

  // Add timestamp to event
  data.event.start_time = now.toISOString();

  const { success, response } = await postRequest<{ errors: unknown[] }>(url, {
    config_id: process.env.PANGEA_AUDIT_CONFIG_ID,
    ...data,
  });

  if (!success) {
    console.log("AUDIT LOG ERROR:", response.result.errors);
  }
}

export async function auditSearchRequest(data: object) {
  const url = getUrl("audit", "v1/search");

  const { success, response } = await postRequest<Audit.SearchResponse>(url, {
    config_id: process.env.PANGEA_AUDIT_CONFIG_ID,
    ...data,
  });

  if (!success) {
    console.log("AUDIT SEARCH ERROR:", response);
    return { error: response.result };
  }

  return response.result;
}

export async function postRequest<T>(
  url: string,
  body: unknown,
  useClientToken = false,
) {
  let response = await fetch(url, {
    method: "POST",
    ...getHeaders(useClientToken),
    body: JSON.stringify(body),
  });

  if (response.status === 202) {
    response = await handleAsync(response);
  }

  const json: ResponseObject<T> = await response.json();
  const success = json.status === "Success";

  return { success, response: json };
}

export async function getRequest(url: string) {
  const response = await fetch(url, {
    method: "GET",
    ...getHeaders(),
  });

  return response;
}

async function handleAsync(response: Response): Promise<Response> {
  const data: ResponseObject<unknown> = await response.json();
  const url = `https://${process.env.NEXT_PUBLIC_PANGEA_BASE_DOMAIN}/request/${data?.request_id}`;
  const maxRetries = 3;
  let retryCount = 1;

  while (response.status === 202 && retryCount <= maxRetries) {
    retryCount += 1;
    const waitTime = retryCount * retryCount * 1000;
    await delay(waitTime);
    response = await getRequest(url);
  }

  return response;
}

export function getUrl(service: string, endpoint: string): string {
  return `https://${service}.${process.env.NEXT_PUBLIC_PANGEA_BASE_DOMAIN}/${endpoint}`;
}

export function getHeaders(useClientToken = false) {
  const options = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${useClientToken ? process.env.NEXT_PUBLIC_PANGEA_CLIENT_TOKEN : process.env.PANGEA_SERVICE_TOKEN}`,
    },
  };

  return options;
}
