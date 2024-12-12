import type { NextRequest } from "next/server";
import { BedrockEmbeddings, ChatBedrockConverse } from "@langchain/aws";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { MemoryVectorStore } from "langchain/vectorstores/memory";

import {
  auditLogRequest,
  auditSearchRequest,
  validateToken,
} from "../requests";
import { rateLimitQuery } from "@src/utils";
import { DAILY_MAX_MESSAGES, PROMPT_MAX_CHARS } from "@src/const";
import { GoogleDriveRetriever } from "@src/google";

const TEMP = 0.5;
const MAX_TOKENS = 512;

const docsLoader = new GoogleDriveRetriever({
  credentials: JSON.parse(process.env.GOOGLE_DRIVE_CREDENTIALS!),
  folderId: process.env.GOOGLE_DRIVE_FOLDER_ID!,
  scopes: ["https://www.googleapis.com/auth/drive.readonly"],
});

const embeddingsModel = new BedrockEmbeddings({
  region: process.env.PANGEA_AI_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});
const llm = new ChatBedrockConverse({
  model: process.env.PANGEA_AI_MODEL!,
  region: process.env.PANGEA_AI_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
  temperature: TEMP,
  maxTokens: MAX_TOKENS,
});
const chain = llm.pipe(new StringOutputParser());

interface RequestBody {
  /** System prompt. */
  systemPrompt?: string;

  /** User's prompt. */
  userPrompt: string;
}

export async function POST(request: NextRequest) {
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
  const result = await auditSearchRequest(limitSearch);

  if (result?.error || (result?.count || 0) >= DAILY_MAX_MESSAGES) {
    return new Response(`{"error": "Daily limit exceeded"}`, {
      status: 400,
    });
  }

  try {
    const vectorStore = await MemoryVectorStore.fromDocuments(
      await docsLoader.invoke(""), // Load all documents.
      embeddingsModel,
    );
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
        event_input: body.userPrompt,
        event_output: text,
        event_type: "llm_response",
        event_context: JSON.stringify({
          system_prompt: systemPrompt,
        }),
        actor: username,
      },
    };

    await auditLogRequest(auditLogData);

    return Response.json({ content: text });
  } catch (err) {
    console.log("Error:", err);
    return new Response(`{"error": "ConverseCommand failed"}`, {
      status: 400,
    });
  }
}
