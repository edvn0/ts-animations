// client/dev.ts
import { serveDir } from "https://deno.land/std@0.224.0/http/file_server.ts";

const backendUrl = Deno.env.get("BACKEND_URL") || "http://localhost:4000";

Deno.serve({ port: 3000 }, async (req) => {
	const url = new URL(req.url);

  if (url.pathname.startsWith("/api") || url.pathname.startsWith("/auth")) {
    const proxyUrl = `${backendUrl}${url.pathname}${url.search}`;
    const proxyRequest = new Request(proxyUrl, {
      method: req.method,
      headers: req.headers,
      body: req.body,
      redirect: "manual"
    });
    return await fetch(proxyRequest);
  }

	return serveDir(req, { fsRoot: "client/dist", quiet: false, });
});
