import type { NextRequest } from "next/server";

import { getUrl, postRequest, validateToken } from "../requests";

const SERVICE_NAME = "audit";
const API_VERSION = "v1";

export async function POST(request: NextRequest) {
  const { success: authenticated, username } = await validateToken(request);

  if (!(authenticated && username)) {
    return new Response("Forbidden", { status: 403 });
  }

  const action = request.nextUrl.searchParams.get("action");
  // biome-ignore lint/suspicious/noExplicitAny: TODO
  const body: any = await request.json();
  body.config_id = process.env.PANGEA_AUDIT_CONFIG_ID;

  let endpoint = "";
  switch (action) {
    case "search":
      body.verbose = false;
      body.return_context = false;
      body.search_restriction = { actor: [username] };
      endpoint = "search";
      break;
    case "page":
      endpoint = "results";
      break;
    case "log":
      body.event.actor = username;
      endpoint = "log";
      break;
    default:
      return Response.json(
        { error: `Audit action '${action}' is invalid` },
        { status: 400 },
      );
  }

  const url = getUrl(SERVICE_NAME, `${API_VERSION}/${endpoint}`);

  const { success, response } = await postRequest(url, body);

  if (!success) {
    console.log(
      "AUDIT LOG ERROR:",
      success,
      response,
      process.env.PANGEA_SERVICE_TOKEN,
    );
    return new Response(JSON.stringify(response), { status: 400 });
  }

  return new Response(JSON.stringify(response.result));
}

export const runtime = "edge";
