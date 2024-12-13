import type { Audit } from "pangea-node-sdk";

import {
  aiProxyRequest,
  auditProxyRequest,
  dataGuardProxyRequest,
  promptGuardProxyRequest,
} from "@src/app/proxy";

export const sendUserMessage = async (
  token: string,
  message: string,
  system: string,
): Promise<string> => {
  const response = await aiProxyRequest(token, {
    userPrompt: message,
    systemPrompt: system,
  });
  return response.content;
};

export const callPromptGuard = async (
  token: string,
  userPrompt: string,
  systemPrompt: string,
): Promise<{ detected: boolean }> => {
  const messages = [
    {
      content: userPrompt,
      role: "user",
    },
  ];

  if (systemPrompt) {
    messages.push({ content: systemPrompt, role: "system" });
  }

  return await promptGuardProxyRequest(token, { messages });
};

export const callInputDataGuard = async (token: string, userPrompt: string) => {
  const payload = {
    recipe: "pangea_prompt_guard",
    text: userPrompt,
  };

  return await dataGuardProxyRequest(token, payload);
};

export const callResponseDataGuard = async (
  token: string,
  llmResponse: string,
) => {
  const payload = {
    recipe: "pangea_llm_response_guard",
    text: llmResponse,
  };

  return await dataGuardProxyRequest(token, payload);
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
