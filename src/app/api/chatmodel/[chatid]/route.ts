import { ChatOpenAI } from "langchain/chat_models/openai";
import { 
  HumanChatMessage, 
  SystemChatMessage, 
  AIChatMessage, 
  BaseChatMessage 
} from "langchain/schema";
import { NextResponse } from "next/server";
import { env } from "@/app/env.mjs";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { chats, Chat } from "@/lib/db/schema";
import { ChatEntry, QuerySchema } from "@/lib/types";

export const revalidate = 0; // disable cache

const jsonToLangchain = (sqldata: Chat, system?: string): BaseChatMessage[] => {
  const log = JSON.parse(sqldata.messages as string)["log"];
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
  params: {params: { chatid: string }}) 
{
  console.log(params.params.chatid);

  // 1. Fetch the chat using the chatid
  const _chat: Chat[] = await db.select()
    .from(chats)
    .where(eq(chats.id, Number(params.params.chatid)))
    .limit(1);

    // await db.update(chats)
    // .set({ messages: JSON.stringify(chat_entries) })
    // .where(eq(chats.id, Number(params.params.chatid)));

  const chat = _chat[0];
  console.log("chat", typeof chat, chat)
  const msgs = jsonToLangchain(chat)
  // console.log("line 45",msgs);

  // 2. Send the message to OpenAI
  //const { query } = QuerySchema.parse(request.body); // Validate the payload and parse it
  //console.log('query: ', query);

  const chatmodel = new ChatOpenAI({
    temperature: 0,
    openAIApiKey: env.OPEN_AI_API_KEY,
    streaming: true
  });
  const response = await chatmodel.call(msgs);


  // added ai response to database
  const messagesObject = JSON.parse(chat?.messages as string)
  // const latestInput = messagesObject.log[messagesObject.log.length - 1]
  // latestInput.apiResponse = response.text
  
  // 
  const latestInput =  messagesObject.log.pop()
  latestInput.apiResponse = response.text
  messagesObject.log.push(latestInput);


  await db.update(chats)
    .set({ messages: JSON.stringify(messagesObject) })
    .where(eq(chats.id, Number(params.params.chatid)));
  


  console.log(response.text);
  return new NextResponse(JSON.stringify(response));
}

