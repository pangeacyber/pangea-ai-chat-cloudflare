import type { NextRequest } from "next/server";

import { getUrl, postRequest, validateToken } from "../requests";

const SERVICE_NAME = "audit";
const API_VERSION = "v1";

export async function POST(request: NextRequest) {
  const { success: authenticated, username } = await validateToken(request);

  if (!(authenticated && username)) {
    console.warn("Caller is not authenticated.");
    return Response.json(
      { error: "Missing or invalid authentication details." },
      { status: 401 },
    );
  }

  const action = request.nextUrl.searchParams.get("action");
  // biome-ignore lint/suspicious/noExplicitAny: TODO
  let body: any = null;
  try {
    body = await request.json();
  } catch (e) {
    console.warn("Error parsing request body", e);
    return Response.json(
      { error: "Could not parse input JSON." },
      { status: 400 },
    );
  }

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
    return Response.json(response, { status: 400 });
  }

  return Response.json(response.result);
}

export const runtime = "edge";
