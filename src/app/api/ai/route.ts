import type { NextRequest } from "next/server";
import {
  BedrockRuntimeClient,
  ConverseCommand,
  Message,
} from "@aws-sdk/client-bedrock-runtime";

import { auditLogRequest, validateToken } from "../requests";

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
