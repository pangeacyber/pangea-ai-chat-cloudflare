import type { NextRequest } from "next/server";
import {
  BedrockRuntimeClient,
  ConverseCommand,
  Message,
} from "@aws-sdk/client-bedrock-runtime";

import {
  auditLogRequest,
  auditSearchRequest,
  validateToken,
} from "../requests";
import { rateLimitQuery } from "@src/utils";
import { DAILY_MAX_MESSAGES } from "@src/const";

const TEMP = 0.5;
const MAX_TOKENS = 512;

export async function POST(request: NextRequest) {
  const { success, username } = await validateToken(request);

  if (!(success && username)) {
    return new Response("Forbidden", { status: 403 });
  }

  const body: any = await request.json();

  const client = new BedrockRuntimeClient({
    region: process.env.PANGEA_AI_REGION,
  });

  const config = {
    maxTokens: MAX_TOKENS,
    temperature: TEMP,
  };
  const systemPrompt = !!body.systemPrompt
    ? { system: [{ text: body.systemPrompt }] }
    : {};
  const conversation: Message[] = [
    {
      role: "user",
      content: [{ text: body.userPrompt }],
    },
  ];

  const limitSearch = rateLimitQuery();
  const result = await auditSearchRequest(limitSearch);

  if (body.userPrompt.length + (body?.systemPrompt?.length || 0) > 15000) {
    return new Response(`{"error": "Maximum prompt size exceeded"}`, {
      status: 400,
    });
  }

  if (result?.error || (result?.count || 0) >= DAILY_MAX_MESSAGES) {
    return new Response(`{"error": "Daily limit exceeded"}`, {
      status: 400,
    });
  }

  try {
    const response = await client.send(
      new ConverseCommand({
        modelId: process.env.PANGEA_AI_MODEL,
        inferenceConfig: config,
        ...systemPrompt,
        messages: conversation,
      }),
    );

    // @ts-ignore
    const text = response.output?.message?.content[0].text || "";
    const llmReply = JSON.stringify(response);

    const auditLogData = {
      event: {
        event_input: body.userPrompt,
        event_output: text,
        event_type: "llm_response",
        event_context: JSON.stringify({
          system_prompt: body.systemPrompt || "",
        }),
        actor: username,
      },
    };

    await auditLogRequest(auditLogData);

    return new Response(llmReply);
  } catch (err) {
    console.log("Error:", err);
    return new Response(`{"error": "ConverseCommand failed"}`, {
      status: 400,
    });
  }
}
