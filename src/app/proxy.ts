import type { AIGuard } from "pangea-node-sdk";

export const dataGuardProxyRequest = async (token: string, body: unknown) => {
  return await baseProxyRequest<AIGuard.TextGuardResult>(
    token,
    "data",
    "",
    body,
  );
};

export const promptGuardProxyRequest = async (
  token: string,
  body: unknown,
): Promise<{ detected: boolean }> => {
  return await baseProxyRequest(token, "prompt", "", body);
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
): Promise<{ content: string }> => {
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
    },
  });

  if (resp.status > 299 || resp.status < 200) {
    const text = await resp.text();
    console.error(`Error: ${text}; while performing ${service}/${action}`);
    throw resp;
  }

  return await resp.json();
};
