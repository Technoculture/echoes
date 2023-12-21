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
  params: { params: { agentId: string; datasourceId: string } },
) {
  const agentId = params.params.agentId;
  const datasourceId = params.params.datasourceId;
  console.log("agentId", agentId);
  console.log("llmId", datasourceId);
  try {
    // remove llm
    await client.agent.removeDatasource(agentId, datasourceId);
    return NextResponse.json({ status: "ok", message: "datasource removed" });
  } catch (err) {
    return NextResponse.json({
      status: "error",
      message: "datasource not removed",
    });
  }
}
