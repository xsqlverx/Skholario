const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, PUT, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400",
};

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...CORS_HEADERS,
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store, no-cache, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
  });
}

export default {
  async fetch(request, env) {
    // 1. Handle CORS Preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: CORS_HEADERS,
      });
    }

    const url = new URL(request.url);

    // Root health-check endpoint
    if (url.pathname === "/" || url.pathname === "/health") {
      return jsonResponse({
        status: "ok",
        service: "skholario-sync",
        timestamp: new Date().toISOString(),
      });
    }

    // Match route: /sync/:email
    const syncMatch = url.pathname.match(/^\/sync\/([^/]+)$/);
    if (!syncMatch) {
      return jsonResponse({ error: "Not Found", path: url.pathname }, 404);
    }

    const rawEmail = syncMatch[1];
    const email = decodeURIComponent(rawEmail).trim().toLowerCase();

    if (!email || !email.includes("@")) {
      return jsonResponse({ error: "Invalid email parameter" }, 400);
    }

    try {
      // 2. GET /sync/:email
      if (request.method === "GET") {
        const raw = await env.SKHOLARIO_KV.get(email);
        if (!raw) {
          return jsonResponse({});
        }

        try {
          const parsed = JSON.parse(raw);
          return jsonResponse(parsed);
        } catch {
          // In case of legacy unparsed string
          return jsonResponse({ data: raw });
        }
      }

      // 3. PUT /sync/:email
      if (request.method === "PUT") {
        let body;
        try {
          body = await request.json();
        } catch {
          return jsonResponse({ error: "Malformed JSON body" }, 400);
        }

        if (typeof body !== "object" || body === null) {
          return jsonResponse({ error: "Body must be a JSON object" }, 400);
        }

        // Attach server sync timestamp metadata
        const payloadToStore = {
          ...body,
          _syncedAt: new Date().toISOString(),
        };

        await env.SKHOLARIO_KV.put(email, JSON.stringify(payloadToStore));

        return jsonResponse({
          success: true,
          email,
          syncedAt: payloadToStore._syncedAt,
        });
      }

      // Method not allowed
      return new Response(JSON.stringify({ error: `Method ${request.method} Not Allowed` }), {
        status: 405,
        headers: {
          ...CORS_HEADERS,
          "Content-Type": "application/json; charset=utf-8",
          Allow: "GET, PUT, OPTIONS",
        },
      });
    } catch (err) {
      return jsonResponse(
        {
          error: "Internal Server Error",
          message: err instanceof Error ? err.message : String(err),
        },
        500,
      );
    }
  },
};
