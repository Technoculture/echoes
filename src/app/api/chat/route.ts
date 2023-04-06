import { ChatOpenAI } from "langchain/chat_models";
import { HumanChatMessage, SystemChatMessage } from "langchain/schema";
import { CallbackManager } from "langchain/callbacks";
import { Redis } from '@upstash/redis';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
// const REDIS_URL = process.env.REDIS_URL;
// const REDIS_TOKEN = process.env.REDIS_TOKEN;
const redis = Redis.fromEnv();

export const revalidate = 0; // disable cache 

export async function GET (request: Request) {
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

  const response = await chat.call([
    new SystemChatMessage("Hello! I'm a chatbot."),
    new HumanChatMessage(
      "Write me a song about sparkling water.."
    ),
  ]);

  // console.log(response);
  // console.log(chat);

  await redis.incr("counter");
  await redis.set('foo', response);

  return;
}
