// get all

// create superagent client
import { env } from "@/app/env.mjs";
import { NextResponse } from "next/server";
import { SuperAgentClient } from "superagentai-js";

const client = new SuperAgentClient({
  environment: "https://api.beta.superagent.sh",
  token: env.SUPERAGENT_API_KEY,
});

export async function GET(request: Request) {
  // list workflows by name
  const { data: workflows } = await client.workflow.list();

  return NextResponse.json({ status: "ok", workflows: workflows });
}
