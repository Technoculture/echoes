import { ChatOpenAI } from "langchain/chat_models/openai";
import { HumanChatMessage, SystemChatMessage, BaseChatMessage } from "langchain/schema";
import { NextResponse } from "next/server";
import { env } from "@/app/env.mjs";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { chats, Chat } from "@/lib/db/schema";

export const revalidate = 0; // disable cache 

//function jsonToLangchain(sqldata: Chat[]): BaseChatMessage[] {
//  return sqldata.map(msg => {
//  });
//}

export async function POST(request: Request, params: { chatid: string }) {
  // 1. Fetch the chat using the chatid
  const _chat: Chat[] = await db.select()
    .from(chats)
    .where(eq(chats.id, Number(params.chatid)))
    .limit(1);
  const chat = _chat[0];
  console.log(chat);

  // 2. Send the message to OpenAI
  // Validate the payload and parse it
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
