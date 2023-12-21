import { NextResponse } from "next/server";
import { SuperAgentClient } from "superagentai-js";
import { env } from "@/app/env.mjs";

const client = new SuperAgentClient({
  environment: "https://api.beta.superagent.sh",
  token: env.SUPERAGENT_API_KEY,
});
export async function POST(request: Request) {
  const { data: llm } = await client.llm.create({
    provider: "OPENAI",
    apiKey: env.OPEN_AI_API_KEY,
  });

  const { data: agent } = await client.agent.create({
    name: "Chat Assistant",
    description: "My first Assistant",
    avatar: "https://myavatar.com/homanp.png",
    isActive: true,
    initialMessage: "Hi there! How can I help you?",
    llmModel: "GPT_3_5_TURBO_16K_0613",
    prompt: "You are an extremely helpful AI Assistant",
  });

  if (agent && llm) {
    await client.agent.addLlm(agent.id, {
      llmId: llm.id,
    });

    const { data: prediction } = await client.agent.invoke(agent.id, {
      input: "Hi there!",
      enableStreaming: false,
      sessionId: "my_session",
    });

    const body = await request.json();

    const { name } = body;

    return NextResponse.json({ status: "ok", prediction: prediction });
  } else {
    return NextResponse.json({ status: "error" });
  }
}
