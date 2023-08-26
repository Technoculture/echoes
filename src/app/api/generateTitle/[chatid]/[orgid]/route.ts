import { ChatOpenAI } from "langchain/chat_models/openai";
import { env } from "@/app/env.mjs";
import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { Chat, chats } from "@/lib/db/schema";
import { jsonToLangchain } from "@/utils/apiHelper";
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
    .limit(1)
    .all();

  const messages = JSON.parse(
    orgConversations[0]?.messages as string,
  ).log.splice(0, 2);

  const fullResponse = await generateTitle(messages);
  await db
    .update(chats)
    .set({ title: fullResponse })
    .where(and(eq(chats.id, Number(chatId)), eq(chats.user_id, String(orgId))))
    .run();
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
  const azure_chat_model: ChatOpenAI = new ChatOpenAI({
    temperature: 0.5,
    azureOpenAIApiKey: process.env.AZURE_OPENAI_API_KEY,
    azureOpenAIApiVersion: process.env.AZURE_OPENAI_API_VERSION,
    azureOpenAIApiInstanceName: process.env.AZURE_OPENAI_API_INSTANCE_NAME,
    azureOpenAIApiDeploymentName: process.env.AZURE_OPENAI_API_DEPLOYMENT_NAME,
  });
  const openai_chat_model: ChatOpenAI = new ChatOpenAI({
    temperature: 0,
    openAIApiKey: env.OPEN_AI_API_KEY,
  });
  const modelWithFallback = openai_chat_model.withFallbacks({
    fallbacks: [azure_chat_model],
  });

  const res = await modelWithFallback.invoke(msgs);
  return res.content;
};
