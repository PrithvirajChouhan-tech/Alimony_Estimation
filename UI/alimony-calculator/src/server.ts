import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => ((m as { default?: ServerEntry }).default ?? (m as unknown as ServerEntry)),
    );
  }
  return serverEntryPromise;
}

function brandedErrorResponse(): Response {
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isCatastrophicSsrErrorBody(body: string, responseStatus: number): boolean {
  let payload: unknown;
  try {
    payload = JSON.parse(body);
  } catch {
    return false;
  }

  if (!payload || Array.isArray(payload) || typeof payload !== "object") {
    return false;
  }

  const fields = payload as Record<string, unknown>;
  const expectedKeys = new Set(["message", "status", "unhandled"]);
  if (!Object.keys(fields).every((key) => expectedKeys.has(key))) {
    return false;
  }

  return (
    fields.unhandled === true &&
    fields.message === "HTTPError" &&
    (fields.status === undefined || fields.status === responseStatus)
  );
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isCatastrophicSsrErrorBody(body, response.status)) {
    return response;
  }

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return brandedErrorResponse();
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const url = new URL(request.url);
      
      // If client requests /api/*, reverse proxy it to the Railway backend.
      // This routes the traffic server-side through Cloudflare to bypass ISP-level domain blocks.
      if (url.pathname.startsWith("/api/")) {
        const backendBaseUrl = "https://ml-based-alimony-estimation-platform-production.up.railway.app";
        const targetUrl = `${backendBaseUrl}${url.pathname.replace(/^\/api/, "")}${url.search}`;
        
        console.log(`[Proxy] ${request.method} ${url.pathname} -> ${targetUrl}`);
        
        const headers = new Headers(request.headers);
        headers.delete("host"); // Let fetch automatically assign the correct host header for the backend
        
        const proxyRequest = new Request(targetUrl, {
          method: request.method,
          headers: headers,
          body: request.method !== "GET" && request.method !== "HEAD" ? await request.clone().arrayBuffer() : undefined,
          redirect: "manual",
        });
        
        const response = await fetch(proxyRequest);
        
        // Inject CORS headers to guarantee smooth client compatibility
        const corsHeaders = new Headers(response.headers);
        corsHeaders.set("Access-Control-Allow-Origin", "*");
        corsHeaders.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
        corsHeaders.set("Access-Control-Allow-Headers", "*");
        
        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: corsHeaders,
        });
      }

      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error("[Worker Error]", error);
      return brandedErrorResponse();
    }
  },
};
