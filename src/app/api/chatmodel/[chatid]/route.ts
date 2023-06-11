import { ChatOpenAI } from "langchain/chat_models/openai";
import { 
  HumanChatMessage, 
  SystemChatMessage, 
  AIChatMessage, 
  BaseChatMessage 
} from "langchain/schema";
import { NextResponse } from "next/server";
import { env } from "@/app/env.mjs";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { chats, Chat } from "@/lib/db/schema";
import { ChatEntry, QuerySchema } from "@/lib/types";

export const revalidate = 0; // disable cache

export const jsonToLangchain = (sqldata: Chat, system?: string): BaseChatMessage[] => {
  const log = JSON.parse(sqldata.messages as string)["log"];
  let ret: BaseChatMessage[] = [];
  if (system) { ret.push(new SystemChatMessage(system)); }

  log.forEach((item: ChatEntry) => {
    if (item.role === "user") {
      ret.push(new HumanChatMessage(item.content));
    } else if (item.role === "assistant") {
      ret.push(new AIChatMessage(item.content));
    }
  });

  return ret;
}

export async function POST(request: Request, params: { chatid: string }) {
  console.log(request);

  // 1. Fetch the chat using the chatid
  const _chat: Chat[] = await db.select()
    .from(chats)
    .where(eq(chats.id, Number(params.chatid)))
    .limit(1);
  const chat = _chat[0];
  const msgs = jsonToLangchain(chat)
  console.log(msgs);

  // 2. Send the message to OpenAI
  const { query } = QuerySchema.parse(request.body); // Validate the payload and parse it
  console.log('query: ', query);

  const chatmodel = new ChatOpenAI({
    temperature: 0,
    openAIApiKey: env.OPEN_AI_API_KEY,
  });
  const response = await chatmodel.call(msgs);

  console.log(response);
  return new NextResponse(JSON.stringify(response));
}

