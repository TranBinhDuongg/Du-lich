import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { handler } = require('../server.js');

export default async function vercelHandler(request) {
  const body = Buffer.from(await request.arrayBuffer());
  const headers = Object.fromEntries(request.headers.entries());
  headers.host ||= new URL(request.url).host;

  const nodeRequest = {
    method: request.method,
    url: request.url,
    headers,
    async *[Symbol.asyncIterator]() {
      if (body.length) yield body;
    },
  };

  let status = 200;
  let responseHeaders = {};
  let responseBody;
  const nodeResponse = {
    writeHead(code, values) {
      status = code;
      responseHeaders = values;
    },
    end(value) {
      responseBody = value;
    },
  };

  await handler(nodeRequest, nodeResponse);
  return new Response(responseBody ?? null, { status, headers: responseHeaders });
}
