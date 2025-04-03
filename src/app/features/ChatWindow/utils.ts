import type { MessageFieldWithRole } from "@langchain/core/messages";
import type { Audit } from "pangea-node-sdk";

import {
  aiProxyRequest,
  auditProxyRequest,
  dataGuardProxyRequest,
  docsProxyRequest,
  unredactProxyRequest,
} from "@src/app/proxy";
import type { DetectorOverrides } from "@src/types";

export const fetchDocuments = async (
  token: string,
  userPrompt: string,
  authz = false,
) => {
  return await docsProxyRequest(token, { userPrompt, authz });
};

export const generateCompletions = async (
  token: string,
  messages: MessageFieldWithRole[],
  systemPrompt: string,
  userPrompt: string,
) => {
  return await aiProxyRequest(token, {
    input: messages,
    systemPrompt,
    userPrompt,
  });
};

export const callInputDataGuard = async (
  token: string,
  messages: readonly MessageFieldWithRole[],
  overrides?: DetectorOverrides,
) => {
  const payload = {
    recipe: "pangea_prompt_guard",
    messages,
    overrides,
  };

  return await dataGuardProxyRequest(token, payload);
};

export const callResponseDataGuard = async (
  token: string,
  llmResponse: string,
  overrides?: DetectorOverrides,
) => {
  const payload = {
    recipe: "pangea_llm_response_guard",
    text: llmResponse,
    overrides,
  };

  return await dataGuardProxyRequest(token, payload);
};

export const unredact = async (
  token: string,
  redacted: string,
  fpe_context: string,
) => {
  const payload = {
    redacted_data: redacted,
    fpe_context,
  };

  return await unredactProxyRequest(token, payload);
};

export const auditUserPrompt = async (token: string, data: unknown) => {
  return await auditProxyRequest<Audit.LogResponse>(token, "log", data);
};

export const auditPromptResponse = async (token: string, data: unknown) => {
  return await auditProxyRequest<Audit.LogResponse>(token, "log", data);
};

export const auditSearch = async (token: string, data: unknown) => {
  return await auditProxyRequest<Audit.SearchResponse>(token, "search", data);
};
