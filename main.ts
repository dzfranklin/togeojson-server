import { DOMParser } from "npm:@xmldom/xmldom@0.8.10";
import * as tj from "npm:@tmcw/togeojson@5.8.1";

Deno.serve(async (req) => {
  const { method } = req;
  const { pathname: path } = new URL(req.url);

  if (path === "/health" && method === "GET") {
    return new Response("OK", { status: 200 });
  } else if (path === "/gpx" && method === "POST") {
    console.log("Received conversion request");
    const gpx = await req.text();
    const dom = new DOMParser().parseFromString(gpx);
    const geojson = tj.gpx(dom);
    return new Response(JSON.stringify(geojson), {
      headers: { "Content-Type": "application/json" },
    });
  } else {
    return new Response("Not Found", { status: 404 });
  }
});
