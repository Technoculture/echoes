import { NextResponse } from "next/server";
import { SuperAgentClient } from "superagentai-js";
import { env } from "@/app/env.mjs";

const client = new SuperAgentClient({
  environment: "https://api.beta.superagent.sh",
  token: env.SUPERAGENT_API_KEY,
});
export async function POST(request: Request) {
  // get agent by id
  const { data: agent } = await client.agent.get(
    "0fae8d8b-a8ef-4828-8191-341b8573944e",
  );

  try {
    // invoke agent
    const { data: prediction } = await client.agent.invoke(agent!.id, {
      enableStreaming: false,
      // input: "what is tesla's revenue"
      input: "what are system calls in go programming language",
    });

    return NextResponse.json({ status: "ok", prediction: prediction });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ status: "error", error });
  }
}
