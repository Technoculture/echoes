import { ChatOpenAI } from "langchain/chat_models/openai";
import { StreamingTextResponse, LangChainStream } from "ai";
import {
  HumanChatMessage,
  SystemChatMessage,
  AIChatMessage,
  BaseChatMessage,
} from "langchain/schema";
import { env } from "@/app/env.mjs";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema";
import { ChatEntry, ChatLog } from "@/lib/types";
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
    if (item.role === "user") {
      ret.push(new HumanChatMessage(item.content));
    } else if (item.role === "assistant") {
      ret.push(new AIChatMessage(item.content));
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

  let id = params.params.chatid as any;
  // exceptional case
  if (_chat.length === 0) {
    console.error("somehow got the length 0, this shouldn't happen if validating messages length before calling the api");
    return ;
  }
  const msgs = jsonToLangchain(_chat);

  const { stream, handlers } = LangChainStream({
    onCompletion: async (fullResponse: string) => {
      const latestReponse = { role: "assistant", content: fullResponse };
      // it means it is the first message in a specific chat id
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
      // }
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
