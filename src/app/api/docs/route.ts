import { getRequestContext } from "@cloudflare/next-on-pages";
import {
  CloudflareVectorizeStore,
  CloudflareWorkersAIEmbeddings,
} from "@langchain/cloudflare";
import type { NextRequest } from "next/server";
import type { AuthZ } from "pangea-node-sdk";

import type { PangeaResponse } from "@src/types";

import { authzCheckRequest, validateToken } from "../requests";

export interface RequestBody {
  /** Whether or not to apply AuthZ. */
  authz: boolean;

  /** User's prompt. */
  userPrompt: string;
}

export async function POST(request: NextRequest) {
  const { success, username } = await validateToken(request);

  if (!(success && username)) {
    return new Response("Forbidden", { status: 403 });
  }

  const { env } = getRequestContext();
  const embeddingsModel = new CloudflareWorkersAIEmbeddings({
    binding: env.AI,
    model: "@cf/baai/bge-base-en-v1.5",
  });

  const body: RequestBody = await request.json();

  const vectorStore = new CloudflareVectorizeStore(embeddingsModel, {
    index: env.VECTORIZE,
  });
  const retriever = vectorStore.asRetriever();
  let docs = await retriever.invoke(body.userPrompt);

  // Filter documents based on user's permissions in AuthZ.
  const authzResponses: PangeaResponse<AuthZ.CheckResult>[] = [];
  if (body.authz) {
    docs = await Promise.all(
      docs.map(async (doc) => {
        const response = await authzCheckRequest({
          subject: { type: "user", id: username },
          action: "read",
          resource: { type: "file", id: doc.id },
          debug: true,
        });
        if ("request_id" in response) {
          authzResponses.push({
            request_id: response.request_id,
            request_time: response.request_time,
            response_time: response.response_time,
            result: response.result,
            status: response.status,
            summary: response.summary,
          });
        }
        return response.result.allowed ? doc : null;
      }),
    ).then((results) => results.filter((doc) => doc !== null));
  }

  return Response.json({
    authzResponses,
    documents: docs.map(({ id, metadata, pageContent }) => ({
      id,
      metadata,
      pageContent,
    })),
  });
}

export const runtime = "edge";
