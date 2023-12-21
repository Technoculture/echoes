import { NextResponse } from "next/server";
import { SuperAgentClient } from "superagentai-js";
import { env } from "@/app/env.mjs";

const client = new SuperAgentClient({
  environment: "https://api.beta.superagent.sh",
  token: env.SUPERAGENT_API_KEY,
});

export async function GET(request: Request) {
  // list llms
  const { data: llms } = await client.llm.list();

  return NextResponse.json({ status: "ok", llms });
}
