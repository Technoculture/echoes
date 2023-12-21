import { NextResponse } from "next/server";
import { SuperAgentClient } from "superagentai-js";
import { env } from "@/app/env.mjs";

const client = new SuperAgentClient({
  environment: "https://api.beta.superagent.sh",
  token: env.SUPERAGENT_API_KEY,
});

export async function POST(request: Request) {
  const body = await request.json();
  try {
    // create agent
    const { data: agent } = await client.agent.create({
      name: body.name,
      description: body.description,
      llmModel: body.llmModel,
      // llmModel: "GPT_3_5_TURBO_16K_0613",
      // llmModel: "GPT_4_1106_PREVIEW",
    });
    return NextResponse.json({ status: "ok", agent });
  } catch (error) {
    console.log("error", error);
    return NextResponse.json(
      { status: "error", error: error },
      { status: 400 },
    );
  }
}
