import type { NextRequest } from "next/server";

import { getUrl, postRequest, validateToken } from "../requests";

const SERVICE_NAME = "audit";
const API_VERSION = "v1";

export async function POST(request: NextRequest) {
  const { success, username } = await validateToken(request);

  if (!(success && username)) {
    return new Response("Forbidden", { status: 403 });
  }

  const action = request.nextUrl.searchParams.get("action");
  const body: any = await request.json();
  body.config_id = process.env.PANGEA_AUDIT_CONFIG_ID;

  let endpoint = "";
  switch (action) {
    case "search":
      body.search_restriction = { actor: [username] };
      endpoint = "search";
      break;
    case "page":
      endpoint = "results";
      break;
    case "download":
      endpoint = "download_results";
      break;
    // case "log":
    //   body.event.actor = username;
    //   endpoint = "log";
    //   break;
  }

  if (!endpoint) {
    return new Response(`{"error": "Audit action '${action}' is invalid"}`, {
      status: 400,
    });
  }

  const url = getUrl(SERVICE_NAME, `${API_VERSION}/${endpoint}`);

  try {
    const { success, response } = await postRequest(url, body);

    if (success) {
      return new Response(JSON.stringify(response.result));
    } else {
      console.log("AUDIT LOG ERROR:", success, response.result.errors);
      return new Response(JSON.stringify(response.result), { status: 400 });
    }
  } catch (err) {
    return new Response(`{"error": ${err}`, {
      status: 500,
    });
  }
}
