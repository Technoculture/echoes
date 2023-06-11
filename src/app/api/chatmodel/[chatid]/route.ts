import { ChatOpenAI } from "langchain/chat_models/openai";
import { HumanChatMessage, SystemChatMessage } from "langchain/schema";
import { NextResponse } from "next/server";
import { env } from "@/app/env.mjs";
import { db } from "@/lib/db";

export const revalidate = 0; // disable cache 

export async function POST(request: Request, params: { chatid: string }) {
  const { searchParams } = new URL(request.url);

  /// Validate the payload and parse it
  const { query } = await request.json();
  console.log('query', query);

  if (query === null) {
    return new NextResponse();
  }

  const chatmodel = new ChatOpenAI({
    temperature: 0,
    openAIApiKey: env.OPEN_AI_API_KEY,
  });

  /// TODO: Fetch from db the chat history given the chatid

  const response = await chatmodel.call([
    new SystemChatMessage("Hello, I am a chatbot. I can help you with your questions."),
    new HumanChatMessage(query),
  ]);

  console.log(response);
  return new NextResponse(JSON.stringify(response));
}
