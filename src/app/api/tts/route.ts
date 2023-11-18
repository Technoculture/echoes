import { env } from "@/app/env.mjs";
import { db } from "@/lib/db";
import { chats, Chat as ChatSchema } from "@/lib/db/schema";
import { ChatEntry, ChatLog } from "@/lib/types";
import { saveAudio } from "@/utils/apiHelper";
import { nanoid } from "ai";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import OpenAI from "openai";
import * as z from "zod";
export const maxDuration = 60;

const bodyobj = z.object({
  text: z.string().min(1),
  messageId: z.string().min(1).optional(),
  orgId: z.string().min(1),
  chatId: z.string().min(1),
  index: z.coerce.number().min(0),
});

export async function POST(request: Request) {
  const b = await request.json();
  const body = bodyobj.parse(b);

  const text = body.text;
  let messageId = body.messageId;
  const orgId = body.orgId;
  const chatId = body.chatId;

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

  // find the message according to the index if no messageId is given
  let message: ChatEntry | undefined;
  if (!messageId) {
    message = chatlog.log[body.index];
    // update all the messages of chatlog.log to have an id using nanoid()
    chatlog.log = chatlog.log.map((msg) => {
      msg.id = msg.id ? msg.id : nanoid();
      return msg;
    });
  } else {
    // finding the message with the given id if not found return last message from log
    message = chatlog.log.find((msg) => msg.id === messageId);
    if (!message) {
      message = chatlog.log[chatlog.log.length - 1];
      message.id = messageId;
    }
  }

  messageId = messageId ? messageId : chatlog.log[body.index].id;

  // adding the audio to the message
  const audioUrl = await saveAudio({ buffer, chatId, messageId });
  message.audio = audioUrl;

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
