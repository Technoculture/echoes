import { NextResponse } from "next/server";
import { StreamingTextResponse } from "ai";
import { SuperAgentClient } from "superagentai-js";
import { env } from "@/app/env.mjs";
import { getStreamFromAgent } from "@/utils/superagent/agenthelpers";

const client = new SuperAgentClient({
  environment: "https://api.beta.superagent.sh",
  token: env.SUPERAGENT_API_KEY,
});

export async function POST(request: Request) {
  const body = await request.json();
  const input = body.input;

  const orgSlug = "testtest";
  const { data: agents } = await client.agent.list();
  if (agents) {
    // find agent by name
    const agent = agents.find((agent) => agent.name === orgSlug);
    if (agent) {
      console.log("agent found", agent.id);
      const stream = await getStreamFromAgent(agent.id, input);

      return new StreamingTextResponse(stream);
    }
  } else {
    console.log("agent not found");
    return NextResponse.json({ error: "agent not fount" }, { status: 404 });
  }

  const stream = new ReadableStream({
    start(controller) {
      controller.close();
    },
  });

  return new StreamingTextResponse(stream);
}
