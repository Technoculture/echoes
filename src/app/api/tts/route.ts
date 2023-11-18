import { env } from "@/app/env.mjs";
import { db } from "@/lib/db";
import { chats, Chat as ChatSchema } from "@/lib/db/schema";
import { ChatLog } from "@/lib/types";
import { saveAudio } from "@/utils/apiHelper";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import OpenAI from "openai";
import * as z from "zod";
export const maxDuration = 60;

const bodyobj = z.object({
  text: z.string().min(1),
  messageId: z.string().min(1),
  orgId: z.string().min(1),
  chatId: z.string().min(1),
});

export async function POST(request: Request) {
  const body = bodyobj.parse(await request.json());

  const text = body.text;
  const messageId = body.messageId;
  const orgId = body.orgId;
  const chatId = body.chatId;
  console.log("id of the message", body.messageId);
  console.log("id of the message", body.orgId);
  console.log("id of the message", body.chatId);

  const Openai = new OpenAI({
    apiKey: env.OPEN_AI_API_KEY,
  });

  const mp3 = await Openai.audio.speech.create({
    model: "tts-1",
    voice: "alloy",
    input: text,
  });

  const buffer = Buffer.from(await mp3.arrayBuffer());
  // fetching the chat
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

  // finding the message with the given id if not found return last message from log
  let message = chatlog.log.find((msg) => msg.id === messageId);
  if (!message) {
    message = chatlog.log[chatlog.log.length - 1];
    message.id = messageId;
  }
  // adding the audio to the message
  const audioUrl = await saveAudio({ buffer, chatId, messageId });
  message.audio = audioUrl;

  console.log("message", message);

  await db
    .update(chats)
    .set({
      messages: JSON.stringify({ log: chatlog.log } as ChatLog),
      updatedAt: new Date(),
    })
    .where(eq(chats.id, Number(chatId)))
    .run();
  return new NextResponse(
    JSON.stringify({ audioUrl: audioUrl, updatedMessages: chatlog.log }),
  );
}
