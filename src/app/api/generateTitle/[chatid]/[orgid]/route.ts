import { ChatOpenAI } from "langchain/chat_models/openai";
import { env } from "@/app/env.mjs";
import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { Chat, chats } from "@/lib/db/schema";
import { jsonToLangchain } from "@/app/api/chatmodel/[chatid]/route";
import { NextResponse } from "next/server";
import { ChatEntry } from "@/lib/types";
export const revalidate = 0; // disable cache

export async function POST(
  request: Request,
  params: { params: { chatid: string; orgid: string } },
  query: any,
) {
  const chatId = params.params.chatid;
  let orgId = params.params.orgid;

  // getting the data from db
  const orgConversations: Chat[] = await db
    .select()
    .from(chats)
    .where(and(eq(chats.id, Number(chatId)), eq(chats.user_id, String(orgId))))
    .limit(1);

  const messages = JSON.parse(
    orgConversations[0]?.messages as string,
  ).log.splice(0, 2);

  const fullResponse = await generateTitle(messages);
  await db
    .update(chats)
    .set({ title: fullResponse })
    .where(and(eq(chats.id, Number(chatId)), eq(chats.user_id, String(orgId))));
  return new NextResponse(fullResponse);
}

export const generateTitle = async (chat: ChatEntry[]): Promise<string> => {
  console.log;
  const FIXED = {
    role: "user",
    content: "GENERATE A TITLE ON THE BASIS OF ABOVE CONVERSATION",
  };
  chat.push(FIXED as ChatEntry);
  const msgs = jsonToLangchain(chat);
  const chatmodel: ChatOpenAI = new ChatOpenAI({
    temperature: 0,
    openAIApiKey: env.OPEN_AI_API_KEY,
  });

  const res = await chatmodel.call(msgs);
  return res.text;
};
