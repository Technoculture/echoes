import { ChatOpenAI } from "langchain/chat_models/openai";
import { StreamingTextResponse, LangChainStream } from "ai";
import {
  HumanChatMessage,
  SystemChatMessage,
  AIChatMessage,
  BaseChatMessage
} from "langchain/schema";
import { NextResponse } from "next/server";
import { env } from "@/app/env.mjs";
import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { chats, Chat } from "@/lib/db/schema";
import { ChatEntry, ChatLog, PostBody } from "@/lib/types";
import { auth } from "@clerk/nextjs";
export const revalidate = 0; // disable cache

const jsonToLangchain = (chatData: ChatEntry[], system?: string): BaseChatMessage[] => {
  let ret: BaseChatMessage[] = [];
  if (system) { ret.push(new SystemChatMessage(system)); }

  chatData.forEach((item: ChatEntry) => {
    if (item.role === "user") {
      ret.push(new HumanChatMessage(item.content));
    } else if (item.role === "assistant") {
      ret.push(new AIChatMessage(item.content));
    }
  });
  return ret;
}



export async function POST(
  request: Request,
  params: { params: { chatid: string } }) {

  const body: PostBody = await request.json();
  const { userId } = auth();
  console.log("userId", userId);


  const _chat: ChatEntry[] = body.messages;

  let chat = {} as ChatEntry;
  let id = params.params.chatid as any;
  // exceptional case
  if (_chat.length === 0) {

    console.log("somehow got the length 0")
    return;
  }
  const msgs = jsonToLangchain(_chat)



  const { stream, handlers } = LangChainStream({
    onCompletion: async (fullResponse: string) => {
      // if(_chat.length > 0){

      if (_chat.length === 1) {
        let latestInput = _chat.pop() as ChatEntry
        latestInput.apiResponse = fullResponse
        _chat.push(latestInput);
        await db.insert(chats).values({
          "user_id": body.user_id,
          "messages": JSON.stringify({ log: _chat } as ChatLog),
        });
      } else {
        let latestInput = _chat.pop() as ChatEntry
        latestInput.apiResponse = fullResponse
        _chat.push(latestInput);
        await db.update(chats)
          .set({ messages: JSON.stringify({ log: _chat }) })
          .where(eq(chats.id, Number(id)));
      }
      // }
    }
  })


  const chatmodel: ChatOpenAI = new ChatOpenAI({
    temperature: 0,
    openAIApiKey: env.OPEN_AI_API_KEY,
    streaming: true,
  });
  chatmodel.call(msgs, {}, [handlers]);
  return new StreamingTextResponse(stream)
}

