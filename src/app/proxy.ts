import type { DocumentInterface } from "@langchain/core/documents";
import type { RequestBody as DocsRequestBody } from "@src/app/api/docs/route";
import type { RequestBody as UnredactRequestBody } from "@src/app/api/unredact/route";
import type { AIGuardResult, PangeaResponse, UnredactResult } from "@src/types";
import type { AuthZ } from "pangea-node-sdk";

export const docsProxyRequest = async (
  token: string,
  body: DocsRequestBody,
): Promise<{
  authzResponses: PangeaResponse<AuthZ.CheckResult>[];
  documents: DocumentInterface[];
}> => {
  return await baseProxyRequest(token, "docs", "", body);
};

export const dataGuardProxyRequest = async (
  token: string,
  body: unknown,
): Promise<PangeaResponse<AIGuardResult>> => {
  return await baseProxyRequest(token, "data", "", body);
};

export const unredactProxyRequest = async (
  token: string,
  body: UnredactRequestBody,
): Promise<PangeaResponse<UnredactResult>> => {
  return await baseProxyRequest(token, "unredact", "", body);
};

export const auditProxyRequest = async <T>(
  token: string,
  action: string,
  body: unknown,
) => {
  return await baseProxyRequest<T>(token, "audit", action, body);
};

export const aiProxyRequest = async (
  token: string,
  body: unknown,
): Promise<{
  content: string;
  authzResponses: PangeaResponse<AuthZ.CheckResult>[];
  documents: DocumentInterface[];
}> => {
  return await baseProxyRequest(token, "ai", "", body);
};

const baseProxyRequest = async <T = unknown>(
  token: string,
  service: string,
  action: string,
  body: unknown,
): Promise<T> => {
  const args = action ? `?action=${action}` : "";
  const resp = await fetch(`/api/${service}${args}`, {
    method: "POST",
    body: JSON.stringify(body),
    cache: "no-cache",
    credentials: "same-origin",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (resp.status > 299 || resp.status < 200) {
    const text = await resp.text();
    console.error(`Error: ${text}; while performing ${service}/${action}`);
    throw resp;
  }

  return await resp.json();
};
