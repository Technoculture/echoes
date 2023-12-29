import { NextResponse } from "next/server";
import { SuperAgentClient } from "superagentai-js";
import { env } from "@/app/env.mjs";

const client = new SuperAgentClient({
  environment: "https://api.beta.superagent.sh",
  token: env.SUPERAGENT_API_KEY,
});

export async function GET(
  request: Request,
  params: { params: { agentId: string } },
) {
  // list datasources
  const { agentId } = params.params;
  const { data: datasources } = await client.agent.listDatasources(agentId);
  return NextResponse.json({ status: "ok", datasources });
}
