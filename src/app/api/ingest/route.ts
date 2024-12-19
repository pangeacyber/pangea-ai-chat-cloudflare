import { getRequestContext } from "@cloudflare/next-on-pages";
import type { VectorizeIndex } from "@cloudflare/workers-types";
import {
  CloudflareVectorizeStore,
  CloudflareWorkersAIEmbeddings,
} from "@langchain/cloudflare";
import type { Document } from "@langchain/core/documents";
import type { NextRequest } from "next/server";

declare global {
  interface CloudflareEnv {
    INGEST_TOKEN: string;

    /** Vectorize index binding. */
    VECTORIZE: VectorizeIndex;
  }
}

interface RequestBody {
  documents: Document<Record<string, unknown>>[];
}

export async function POST(request: NextRequest) {
  const { env } = getRequestContext();

  if (request.headers.get("Authorization") !== `Bearer ${env.INGEST_TOKEN}`) {
    return Response.json({}, { status: 403 });
  }

  const embeddingsModel = new CloudflareWorkersAIEmbeddings({
    binding: env.AI,
  });
  const vectorStore = new CloudflareVectorizeStore(embeddingsModel, {
    index: env.VECTORIZE,
  });

  const body: RequestBody = await request.json();

  if (body.documents.some((doc) => !doc.id)) {
    return Response.json(
      { error: "All documents must have an ID." },
      { status: 400 },
    );
  }

  await vectorStore.addDocuments(body.documents, {
    ids: body.documents.map(({ id }) => id) as string[],
  });

  return Response.json({});
}

export const runtime = "edge";
