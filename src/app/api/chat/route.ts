import { ChatOpenAI } from "langchain/chat_models";
import { HumanChatMessage, SystemChatMessage, BaseChatMessage } from "langchain/schema";
import { CallbackManager } from "langchain/callbacks";
import { Redis } from '@upstash/redis';
import { NextResponse } from "next/server";

const redis = Redis.fromEnv();

export const revalidate = 0; // disable cache 

async function cached (
  func: (m: BaseChatMessage[]) => Promise<any>,
  messages: BaseChatMessage[]
) {
  let cached_response = await redis.get(JSON.stringify(messages));
  if (cached_response)
  {
    console.log("cache hit");
    console.log(cached_response);
    return new NextResponse(JSON.stringify(cached_response));
  }

  const response = await func(messages);

  await redis.incr("counter");
  await redis.set(JSON.stringify(messages), response);
}

type ChatRequest = BaseChatMessage[];

export async function GET (request: Request) {
  const { searchParams } = new URL(request.url);

  let chat_req = searchParams.get("chat");
  console.log(chat_req);

  let s = "";

  const chat = new ChatOpenAI({
    temperature: 0,
    streaming: true,
    callbackManager: CallbackManager.fromHandlers({
      async handleLLMNewToken (token: string) {
        console.clear();
        s += token;
        console.log(s);
      },
    }),
  });

  if (chat_req != null)
  {
    let messages = JSON.parse(chat_req);
    console.log(messages);
    return await cached(chat.call, messages);
  }


  let messages = [
    new SystemChatMessage("Hello! I'm a chatbot."),
    new HumanChatMessage(
      "Write me a Haiku about sparkling water.."
    ),
  ];

  const response = await cached(chat.call, messages);

  return new NextResponse(JSON.stringify(response));
}
