import { DOMParser } from "npm:@xmldom/xmldom@0.8.10";
import * as tj from "npm:@tmcw/togeojson@5.8.1";
import * as metrics from "npm:prom-client@15.1.2";

const port = Number.parseInt(Deno.env.get("PORT") || "8000");
if (Number.isNaN(port)) {
  console.error("Invalid PORT");
  Deno.exit(1);
}

const registry = new metrics.Registry();
const gpxConversionSecondsHistogram = new metrics.Histogram({
  name: "gpx_conversion_seconds",
  help: "Duration of GPX to GeoJSON conversion in seconds",
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1.0, 2.5, 5.0, 10.0],
  registers: [registry],
});

async function handler(
  req: Request,
  _info: Deno.ServeHandlerInfo
): Promise<Response> {
  const { method } = req;
  const { pathname: path } = new URL(req.url);

  if (path === "/health" && method === "GET") {
    return new Response("OK", { status: 200 });
  } else if (path === "/metrics" && method === "GET") {
    const data = await registry.metrics();
    return new Response(data, {
      headers: { "Content-Type": "text/plain" },
    });
  } else if (path === "/gpx" && method === "POST") {
    console.log("Received conversion request");
    const gpx = await req.text();

    const start = performance.now();

    let geojson: unknown;
    try {
      const dom = new DOMParser().parseFromString(gpx);
      geojson = tj.gpx(dom);
    } catch (_e) {
      return new Response("Bad Request", { status: 400 });
    }

    const end = performance.now();
    gpxConversionSecondsHistogram.observe((end - start) / 1000);

    return new Response(JSON.stringify(geojson), {
      headers: { "Content-Type": "application/json" },
    });
  } else {
    return new Response("Not Found", { status: 404 });
  }
}

Deno.serve({ handler, port });
