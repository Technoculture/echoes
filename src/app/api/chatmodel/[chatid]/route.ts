import { ChatOpenAI } from "langchain/chat_models/openai";
import { StreamingTextResponse, LangChainStream, Message } from "ai";
import {
  HumanChatMessage,
  SystemChatMessage,
  AIChatMessage,
  BaseChatMessage,
} from "langchain/schema";
import { NextResponse } from "next/server";
import { env } from "@/app/env.mjs";
import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { chats, Chat } from "@/lib/db/schema";
import { ChatEntry, ChatLog, PostBody } from "@/lib/types";
import { auth } from "@clerk/nextjs";
export const revalidate = 0; // disable cache

const jsonToLangchain = (
  chatData: ChatEntry[],
  system?: string,
): BaseChatMessage[] => {
  let ret: BaseChatMessage[] = [];
  if (system) {
    ret.push(new SystemChatMessage(system));
  }

  chatData.forEach((item: ChatEntry) => {
    if (item.hasOwnProperty("role")) {
      if (item.role === "user") {
        ret.push(new HumanChatMessage(item.content));
      } else if (item.role === "assistant") {
        ret.push(new AIChatMessage(item.content));
      }
    }
  });
  return ret;
};

export async function POST(
  request: Request,
  params: { params: { chatid: string } },
) {
  const body = await request.json();
  const { userId } = auth();

  const _chat = body.messages;
  let orgId = "";
  orgId = body.orgId;

  console.log("orgId", orgId);

  let id = params.params.chatid as any;
  // exceptional case
  if (_chat.length === 0) {
    console.log("somehow got the length 0");
    return;
  }
  // console.log("incoming chats", _chat.length)
  const msgs = jsonToLangchain(_chat);
  // console.log("jsontolangchain", msgs)

  const { stream, handlers } = LangChainStream({
    onCompletion: async (fullResponse: string) => {
      const latestReponse = { role: "assistant", content: fullResponse };

      if (orgId !== "") {
        // it means it is the first message in a specific chat id
        // Handling organization chat inputs
        const userInput = _chat.pop();
        userInput["createdBy"] = userId;
        if (_chat.length === 0) {
          console.log("got in 1 length case");
          _chat.push(userInput);
          _chat.push(latestReponse);
          console.log("db push", _chat);
          await db.insert(chats).values({
            user_id: String(orgId),
            messages: JSON.stringify({ log: _chat } as ChatLog),
          });
          console.log("inserted");
        } else {
          console.log("more than 1 case");
          _chat.push(userInput);
          _chat.push(latestReponse);
          await db
            .update(chats)
            .set({ messages: JSON.stringify({ log: _chat }) })
            .where(eq(chats.id, Number(id)));
          console.log("updated");
        }
      } else {
        // it means it is the first message in a specific chat id
        // Handling User's Personal chat
        if (_chat.length === 1) {
          _chat.push(latestReponse);
          await db.insert(chats).values({
            user_id: String(userId),
            messages: JSON.stringify({ log: _chat } as ChatLog),
          });
        } else {
          _chat.push(latestReponse);
          await db
            .update(chats)
            .set({ messages: JSON.stringify({ log: _chat }) })
            .where(eq(chats.id, Number(id)));
        }
      }
    },
  });

  const chatmodel: ChatOpenAI = new ChatOpenAI({
    temperature: 0,
    openAIApiKey: env.OPEN_AI_API_KEY,
    streaming: true,
  });
  chatmodel.call(msgs, {}, [handlers]);
  return new StreamingTextResponse(stream);
}
