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
  // list datasources by name
  const { data: datasources } = await client.datasource.list();

  return NextResponse.json({ status: "ok", datasources: datasources });
}
