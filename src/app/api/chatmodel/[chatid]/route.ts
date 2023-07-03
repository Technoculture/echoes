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
import { ChatEntry, ChatLog, PostBody} from "@/lib/types";
import { auth } from "@clerk/nextjs";
export const revalidate = 0; // disable cache

const jsonToLangchain = (sqldata: Chat, system?: string): BaseChatMessage[] => {
  const log = JSON.parse(sqldata.messages as string)["log"];
  console.log("jsontotlangchain Log", log)
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



export async function POST(
  request: Request,
  params: { params: { chatid: string } }) {

    const body : PostBody = await request.json();
    const {userId} = auth();
    console.log("userId", userId);
  // console.log(params.params.chatid);

  // 1. Check if id alreay exists or not

  // 2. Fetch the chat using the chatid
  const _chat: Chat[] = await db.select()
    .from(chats)
    .where(and(eq(chats.id, Number(params.params.chatid)), eq(chats.user_id, body.user_id)))
    .limit(1);
    console.log("typeof", _chat)

    let chat = {} as Chat;
    if(_chat.length === 0){
      const { insertId } = await db.insert(chats).values({
        "user_id": body.user_id,
        "messages": JSON.stringify({log: [body.message]} as ChatLog),
      });
      // setting chat variable as if it is coming from db
      chat = {id: Number(insertId), user_id: body.user_id, messages: JSON.stringify({log: [body.message]})} as Chat
      console.log("chat empty", insertId )
    } else {
      // adding incoming input to the chat variable that is coming from db
      chat ={..._chat[0], messages: JSON.stringify({log: [...JSON.parse(_chat[0].messages as string).log, body.message]  })};
    }

    const msgs = jsonToLangchain(chat)


  //  messages Object from db to update with ai response 
  const messagesObject = JSON.parse(chat?.messages as string)

  // 3. Send the message to OpenAI
  //const { query } = QuerySchema.parse(request.body); // Validate the payload and parse it


  const {stream, handlers} = LangChainStream({
    onCompletion: async (fullResponse: string) => {
      const latestInput = messagesObject.log.pop()
      latestInput.apiResponse = fullResponse
      messagesObject.log.push(latestInput);
      await db.update(chats)
        .set({ messages: JSON.stringify(messagesObject) })
        .where(eq(chats.id, Number(params.params.chatid)));
    }
  })


  const chatmodel: ChatOpenAI = new ChatOpenAI({
    temperature: 0,
    openAIApiKey: env.OPEN_AI_API_KEY,
    streaming: true,
  });
  chatmodel.call(msgs,{}, [handlers]);
  return new StreamingTextResponse(stream)
}

