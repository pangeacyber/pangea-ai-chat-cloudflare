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

  // @ts-ignore
  return response.output?.message?.content[0].text || "";
};

export const callPromptGuard = async (
  token: string,
  userPrompt: string,
  systemPrompt: string,
): Promise<any> => {
  const messages = [
    {
      content: userPrompt,
      role: "user",
    },
  ];

  if (!!systemPrompt) {
    messages.push({ content: systemPrompt, role: "system" });
  }

  return await promptGuardProxyRequest(token, { messages });
};

export const callInputDataGuard = async (
  token: string,
  userPrompt: string,
): Promise<any> => {
  const payload = {
    recipe: "pangea_prompt_guard",
    text: userPrompt,
  };

  return await dataGuardProxyRequest(token, payload);
};

export const callResponseDataGuard = async (
  token: string,
  llmResponse: string,
): Promise<any> => {
  const payload = {
    recipe: "pangea_llm_response_guard",
    text: llmResponse,
  };

  return await dataGuardProxyRequest(token, payload);
};

export const auditUserPrompt = async (
  token: string,
  data: any,
): Promise<any> => {
  return await auditProxyRequest(token, "log", data);
};

export const auditPromptResponse = async (
  token: string,
  data: any,
): Promise<any> => {
  return await auditProxyRequest(token, "log", data);
};

export const auditSearch = async (token: string, data: any): Promise<any> => {
  return await auditProxyRequest(token, "search", data);
};
