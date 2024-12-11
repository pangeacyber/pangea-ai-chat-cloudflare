export const dataGuardProxyRequest = async (
  token: string,
  body: any,
): Promise<Response> => {
  return baseProxyRequest(token, "data", "", body);
};

export const promptGuardProxyRequest = async (
  token: string,
  body: any,
): Promise<Response> => {
  return baseProxyRequest(token, "prompt", "", body);
};

export const auditProxyRequest = async (
  token: string,
  action: string,
  body: any,
): Promise<Response> => {
  return baseProxyRequest(token, "audit", action, body);
};

export const aiProxyRequest = async (
  token: string,
  body: any,
): Promise<{ content: string }> => {
  return baseProxyRequest(token, "ai", "", body);
};

const baseProxyRequest = async <T = unknown>(
  token: string,
  service: string,
  action: string,
  body: unknown,
): Promise<T> => {
  const args = !!action ? `?action=${action}` : "";
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
