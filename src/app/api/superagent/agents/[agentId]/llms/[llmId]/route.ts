import { NextResponse } from "next/server";
import { SuperAgentClient } from "superagentai-js";
import { env } from "@/app/env.mjs";

const client = new SuperAgentClient({
  environment: "https://api.beta.superagent.sh",
  token: env.SUPERAGENT_API_KEY,
});

// remove an llm
export async function DELETE(
  request: Request,
  params: { params: { agentId: string; llmId: string } },
) {
  const agentId = params.params.agentId;
  const llmId = params.params.llmId;
  console.log("agentId", agentId);
  console.log("llmId", llmId);
  try {
    // remove llm
    await client.agent.removeLlm(agentId, llmId);
    return NextResponse.json({ status: "ok", message: "llm removed" });
  } catch (err) {
    return NextResponse.json({ status: "error", message: "llm not removed" });
  }
}
