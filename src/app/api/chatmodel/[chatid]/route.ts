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
import { auth, currentUser } from "@clerk/nextjs";
import { generateTitle } from "../../generateTitle/[chatid]/[orgid]/route";
export const revalidate = 0; // disable cache

export const jsonToLangchain = (
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

  const user = await currentUser();
  const username = user?.firstName + " " + user?.lastName;
  const _chat = body.messages;
  const isFast = body.isFast;
  let orgId = "";
  orgId = body.orgId;

  console.log("orgId", orgId);
  console.log("got isFast", isFast);

  let id = params.params.chatid as any;
  // exceptional case
  if (_chat.length === 0) {
    console.error(
      "somehow got the length 0, this shouldn't happen if validating messages length before calling the api",
    );
    return;
  }
  const msgs = jsonToLangchain(_chat);

  const { stream, handlers } = LangChainStream({
    onCompletion: async (fullResponse: string) => {
      const latestReponse = { role: "assistant", content: fullResponse };
      if (orgId !== "") {
        // it means it is the first message in a specific chat id
        // Handling organization chat inputs
        const userInput = _chat.pop();
        userInput["name"] = `${username},${userId}`;
        if (_chat.length === 0) {
          console.log("got in 1 length case");
          _chat.push(userInput);
          _chat.push(latestReponse);
          const title = await generateTitle(_chat as ChatEntry[]);
          _chat.pop();
          console.log("generated title", title);
          await db
            .update(chats)
            .set({
              messages: JSON.stringify({ log: _chat } as ChatLog),
              title: title,
            })
            .where(eq(chats.id, Number(id)))
            .run();
          console.log("inserted");
        } else {
          console.log("more than 1 case");
          _chat.push(userInput);
          _chat.push(latestReponse);
          await db
            .update(chats)
            .set({
              messages: JSON.stringify({ log: _chat }),
              updatedAt: new Date(),
            })
            .where(eq(chats.id, Number(id)))
            .run();
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

  // change model type based on isFast variable and OPEN_AI_API_KEY as well
  const chatmodel: ChatOpenAI = new ChatOpenAI({
    modelName: isFast ? "gpt-4" : "gpt-3.5-turbo",
    temperature: 0,
    openAIApiKey: env.OPEN_AI_API_KEY,
    streaming: true,
  });
  chatmodel.call(msgs, {}, [handlers]);
  return new StreamingTextResponse(stream);
}
