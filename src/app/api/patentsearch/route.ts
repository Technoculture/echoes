import * as z from "zod";
import axios from "axios";
import { env } from "@/app/env.mjs";
import { NextResponse } from "next/server";
import { Message, nanoid } from "ai";
import { ChatLog, Result } from "@/lib/types";
import { Chat as ChatSchema, chats } from "@/lib/db/schema";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";

const baseUrl = "https://api.projectpq.ai/";

const requestbody = z.object({
  query: z.string(),
});

type RequestBody = z.infer<typeof requestbody>;

export async function POST(request: Request) {
  
  const body = await request.json();
  const msgs = body.msgs as Message[];
  const orgId = body.orgId as string;
  const chatId = body.chatId as string;
  const lastMessageIndex = body.lastMessageIndex as string;

  console.log("orgId", orgId);
  console.log("chatId", chatId);
  console.log("lastMessageIndex", lastMessageIndex);

  // console.log("messages", msgs)
  const query = msgs.map((msg) => msg.content).join(" ");
  console.log("query", query);

  // getting the chat
  let chatlog: ChatLog = { log: [] };
  let fetchedChat: ChatSchema[] = [];
  fetchedChat = await db
    .select()
    .from(chats)
    .where(eq(chats.id, Number(chatId)))
    .all();

  const msg = fetchedChat[0]?.messages;
  if (fetchedChat.length === 1 && msg) {
    chatlog = JSON.parse(msg as string) as ChatLog;
  }
  const prevChatData = chatlog.log.slice(0, Number(lastMessageIndex) + 1);
  const nextChatData = chatlog.log.slice(
    Number(lastMessageIndex) + 1,
    chatlog.log.length,
  );
  console.log(
    "prevChatData",
    prevChatData.length,
    nextChatData.length,
    chatlog.log.length,
  );

  console.log("prevChatData", nextChatData);

  const res = await axios.get(`${baseUrl}/search/102`, {
    params: {
      q: query,
      n: 5,
      type: "patent",
      token: env.PQAI_API_KEY,
    },
  });

  const data = res.data.results as Result[];

  console.log("data", data);

  const patentMessage = {
    role: "assistant",
    subRole: "patent-search",
    content: JSON.stringify(data),
    id: nanoid(),
  } as Message;

  const updatedChatLog = [...prevChatData, patentMessage, ...nextChatData];

  // inserting patent search result into chat logs
  await db
    .update(chats)
    .set({
      messages: JSON.stringify({ log: updatedChatLog }),
      updatedAt: new Date(),
    })
    .where(eq(chats.id, Number(chatId)))
    .run();

  // console.log(data)

  return NextResponse.json({ data: updatedChatLog });
}
