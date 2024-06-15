import { DOMParser } from "npm:@xmldom/xmldom@0.8.10";
import * as tj from "npm:@tmcw/togeojson@5.8.1";

const port = Number.parseInt(Deno.env.get("PORT") || "8000");
if (Number.isNaN(port)) {
  console.error("Invalid PORT");
  Deno.exit(1);
}

async function handler(
  req: Request,
  _info: Deno.ServeHandlerInfo
): Promise<Response> {
  const { method } = req;
  const { pathname: path } = new URL(req.url);

  if (path === "/health" && method === "GET") {
    return new Response("OK", { status: 200 });
  } else if (path === "/gpx" && method === "POST") {
    console.log("Received conversion request");
    const gpx = await req.text();

    let geojson: unknown;
    try {
      const dom = new DOMParser().parseFromString(gpx);
      geojson = tj.gpx(dom);
    } catch (_e) {
      return new Response("Bad Request", { status: 400 });
    }

    return new Response(JSON.stringify(geojson), {
      headers: { "Content-Type": "application/json" },
    });
  } else {
    return new Response("Not Found", { status: 404 });
  }
}

Deno.serve({ handler, port });
