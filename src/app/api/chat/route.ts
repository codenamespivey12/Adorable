import { getApp } from "@/actions/get-app";
import { freestyle } from "@/lib/freestyle";
import { getAppIdFromHeaders } from "@/lib/utils";
import { MCPClient } from "@mastra/mcp";
import { builderAgent } from "@/mastra/agents/builder";
import { deleteStream, getStream, setStream } from "@/lib/streams";
import { CoreMessage } from "@mastra/core";
import { getApp } from "@/actions/get-app";

// Access global streams
declare global {
  var streams: Record<string, { readable: ReadableStream; prompt?: string }>;
}

const streams = globalThis.streams || {};

// "fix" mastra mcp bug
import { EventEmitter } from "events";

EventEmitter.defaultMaxListeners = 1000;

export async function POST(req: Request) {
  const appId = getAppIdFromHeaders(req);

  if (!appId) {
    return new Response("Missing App Id header", { status: 400 });
  }

  const app = await getApp(appId);
  if (!app) {
    return new Response("App not found", { status: 404 });
  }

  const existingStream = await getStream(appId);
  if (existingStream) {
    const [stream1, stream2] = streams[appId].readable.tee();
    streams[appId] = { readable: stream2, prompt: streams[appId].prompt };
    return new Response(stream1, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  }

  const { mcpEphemeralUrl, ephemeralUrl } = await freestyle.requestDevServer({
    repoId: app.info.gitRepo,
    baseId: app.info.baseId,
  });

  const { message }: { message: CoreMessage } = await req.json();

  const mcpServers: Record<string, any> = {
    dev_server: {
      url: new URL(mcpEphemeralUrl),
    },
    mcp_docker: {
      command: "docker",
      args: [
        "run",
        "-i",
        "--rm",
        process.env.MCP_DOCKER_IMAGE || "alpine/socat",
        "STDIO",
        `TCP:host.docker.internal:${process.env.MCP_DOCKER_PORT || "8811"}`,
      ],
    },
  };

  if (process.env.SUPABASE_ACCESS_TOKEN) {
    mcpServers["supabase"] = {
      command: "npx",
      args: [
        "-y",
        "@supabase/mcp-server-supabase@latest",
        "--access-token",
        process.env.SUPABASE_ACCESS_TOKEN,
      ],
    };
  }

  const mcp = new MCPClient({
    id: crypto.randomUUID(),
    servers: mcpServers,
  });

  const toolsets = await mcp.getToolsets();

  const rootStream = new TransformStream();

  let fixCount = 0;
  async function runAgent(prompt: Parameters<typeof builderAgent.stream>[0]) {
    const stream = await builderAgent.stream(prompt, {
      threadId: appId,
      resourceId: appId,
      maxSteps: 100,
      maxRetries: 0,
      maxTokens: 64000,

      // experimental_continueSteps: true,
      toolsets,
      onError: async (error) => {
        await mcp.disconnect();
        console.error("Error:", error);
      },
      onFinish: async (res) => {
        deleteStream(appId!);
        console.log("Finished with reason:", res.finishReason);

        if (res.finishReason === "tool-calls" && fixCount < 10) {
          fixCount++;
          runAgent([
            {
              role: "user",
              content: "continue",
            },
          ]);

          return;
        }

        const pageRes = await fetch(ephemeralUrl);

        if (!pageRes.ok && fixCount < 10) {
          fixCount++;
          console.log("the page errored");
          runAgent([
            {
              role: "user",
              content: "The page returned 500. Please fix it.",
            },
          ]);
          return;
        }

        if (fixCount == 10) {
          console.log("reached max fix count, will not retry anymore");
        } else {
          console.log("no detected errors. ending stream");
        }

        await mcp.disconnect();
        // todo: better solution
        await rootStream.writable.abort();
        console.log("Stream ended");
      },
      toolCallStreaming: true,
    });

    const dataStream = stream.toDataStream();
    dataStream.pipeThrough(rootStream, {
      preventClose: true,
    });
  }

  runAgent(message.content);

  const [stream1, stream2] = rootStream.readable.tee();
  await setStream(appId, stream2, message.content);

  return new Response(stream1, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

export async function GET(req: Request) {
  const appId = getAppIdFromHeaders(req);
  if (!appId) {
    return new Response("Missing App Id header", { status: 400 });
  }

  return new Response(
    JSON.stringify({
      stream: streams[appId] && {
        prompt: streams[appId].prompt,
      },
    })
  );
}
