import { getRequestContext } from "@cloudflare/next-on-pages";
import type {
  Ai,
  VectorizeIndex,
} from "@cloudflare/workers-types/experimental";
import {
  ChatCloudflareWorkersAI,
  CloudflareVectorizeStore,
  CloudflareWorkersAIEmbeddings,
} from "@langchain/cloudflare";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
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
  model: "@cf/meta/llama-2-7b-chat-int8",
});
const chain = llm.pipe(new StringOutputParser());

interface RequestBody {
  /** System prompt. */
  systemPrompt?: string;

  /** User's prompt. */
  userPrompt: string;
}

export async function POST(request: NextRequest) {
  const { env } = getRequestContext();
  const embeddingsModel = new CloudflareWorkersAIEmbeddings({
    binding: env.AI,
  });

  const { success, username, profile } = await validateToken(request);

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

  const limitSearch = rateLimitQuery();
  limitSearch.search_restriction = { actor: [username] };
  // biome-ignore lint/suspicious/noExplicitAny: TODO
  const result: any = await auditSearchRequest(limitSearch);

  if (result.error || (result.count || 0) >= DAILY_MAX_MESSAGES) {
    return new Response(`{"error": "Daily limit exceeded"}`, {
      status: 400,
    });
  }

  const vectorStore = new CloudflareVectorizeStore(embeddingsModel, {
    index: env.VECTORIZE,
  });
  const retriever = vectorStore.asRetriever();
  const docs = await retriever.invoke(body.userPrompt);
  const context = docs.length
    ? `PTO balances:\n${docs
        .map(({ pageContent }) => pageContent)
        .join("\n\n")})`
    : "";

  const text = await chain.invoke([
    new SystemMessage(`${systemPrompt}
User's first name: ${profile.first_name}
User's last name: ${profile.last_name}
Context: ${context}`),
    new HumanMessage(body.userPrompt),
  ]);

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
