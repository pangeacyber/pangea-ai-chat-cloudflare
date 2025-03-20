import type { Ai, VectorizeIndex } from "@cloudflare/workers-types";
import { ChatCloudflareWorkersAI } from "@langchain/cloudflare";
import type { MessageFieldWithRole } from "@langchain/core/messages";
import { StringOutputParser } from "@langchain/core/output_parsers";
import type { NextRequest } from "next/server";

import { DAILY_MAX_MESSAGES, PROMPT_MAX_CHARS } from "@src/const";
import { rateLimitQuery } from "@src/utils";
import {
  auditLogRequest,
  auditSearchRequest,
  validateToken,
} from "../requests";

declare global {
  interface CloudflareEnv {
    /** Workers AI binding. */
    AI: Ai;

    /** Vectorize index binding. */
    VECTORIZE: VectorizeIndex;
  }
}

const llm = new ChatCloudflareWorkersAI({
  model: "@cf/meta/llama-3.2-3b-instruct",
});
const chain = llm.pipe(new StringOutputParser());

interface RequestBody {
  input: MessageFieldWithRole[];

  /** System prompt. */
  systemPrompt?: string;

  /** User's prompt. */
  userPrompt: string;
}

export async function POST(request: NextRequest) {
  const { success, username } = await validateToken(request);

  if (!(success && username)) {
    return new Response("Forbidden", { status: 403 });
  }

  const body: RequestBody = await request.json();
  const systemPrompt = body.systemPrompt || "";

  if (body.userPrompt.length + systemPrompt.length > PROMPT_MAX_CHARS) {
    return new Response(`{"error": "Maximum prompt size exceeded"}`, {
      status: 400,
    });
  }

  // Rate limit for non-Pangeans. Email addresses are assumed to have been
  // verified by the social auth providers.
  if (!username.endsWith("@pangea.cloud")) {
    const limitSearch = rateLimitQuery();
    limitSearch.search_restriction = { actor: [username] };
    // biome-ignore lint/suspicious/noExplicitAny: TODO
    const result: any = await auditSearchRequest(limitSearch);

    if (result.error || (result.count || 0) >= DAILY_MAX_MESSAGES) {
      return new Response(`{"error": "Daily limit exceeded"}`, {
        status: 400,
      });
    }
  }

  const text = await chain.invoke(body.input);

  const auditLogData = {
    event: {
      input: body.userPrompt,
      output: text,
      type: "llm_response",
      context: JSON.stringify({
        system_prompt: systemPrompt,
      }),
      actor: username,
    },
  };

  await auditLogRequest(auditLogData);

  return Response.json({ content: text });
}

export const runtime = "edge";
