import { NextResponse } from "next/server";
import { SuperAgentClient } from "superagentai-js";
import { env } from "@/app/env.mjs";

const client = new SuperAgentClient({
  environment: "https://api.beta.superagent.sh",
  token: env.SUPERAGENT_API_KEY,
});

// add an llm
export async function POST(
  request: Request,
  params: { params: { agentId: string } },
) {
  const agentId = params.params.agentId;
  const body = await request.json();
  const llmId = body.llmId;
  console.log("llmId", llmId);

  // add llm
  const { data: llm } = await client.agent.addLlm(agentId, {
    llmId: llmId,
  });

  console.log("agentId", agentId);

  return NextResponse.json({ status: "ok", agentId });
}
