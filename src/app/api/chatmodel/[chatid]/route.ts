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
  params: { params: { chatid: string } }) {
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


  const encoder = new TextEncoder();

  const stream = new TransformStream();
  const writer = stream.writable.getWriter();
  let data = '';

  const chatmodel: ChatOpenAI = new ChatOpenAI({
    temperature: 0,
    openAIApiKey: env.OPEN_AI_API_KEY,
    streaming: true,
    callbacks: [
      {
        async handleLLMNewToken(token) {
          console.log("got new token")
          await writer.ready;
          console.log("token", token)
          data += token
          await writer.write(encoder.encode(`${token}`));
        },
        async handleLLMEnd() {
          await writer.ready;
          await writer.close();
        },
      },
    ],
  });
   chatmodel.call(msgs);

  // let counter = 0;
  // const encoder = new TextEncoder();
  // const decoder = new TextDecoder();
  // const stream = new ReadableStream({
  //   async start(controller) {
  //     // callback
  //     function onParse(event: ParsedEvent | ReconnectInterval) {
  //       if (event.type === "event") {
  //         const data = event.data;
  //         // https://beta.openai.com/docs/api-reference/completions/create#completions/create-stream
  //         if (data === "[DONE]") {
  //           controller.close();
  //           return;
  //         }
  //         try {
  //           const json = JSON.parse(data);
  //           const text = json.choices[0].delta?.content || "";
  //           if (counter < 2 && (text.match(/\n/) || []).length) {
  //             // this is a prefix character (i.e., "\n\n"), do nothing
  //             return;
  //           }
  //           const queue = encoder.encode(text);
  //           controller.enqueue(queue);
  //           counter++;
  //         } catch (e) {
  //           // maybe parse error
  //           controller.error(e);
  //         }
  //       }
  //     }

  //     // stream response (SSE) from OpenAI may be fragmented into multiple chunks
  //     // this ensures we properly read chunks and invoke an event for each SSE event stream
  //     const parser = createParser(onParse);
  //     // https://web.dev/streams/#asynchronous-iteration
  //     for await (const chunk of response.body as any) {
  //       parser.feed(decoder.decode(chunk));
  //     }
  //   },
  // });


  // added ai response to database
          // const messagesObject = JSON.parse(chat?.messages as string)
  // const latestInput = messagesObject.log[messagesObject.log.length - 1]
  // latestInput.apiResponse = response.text

  // 
  // const latestInput = messagesObject.log.pop()
  // latestInput.apiResponse = response.text
  // messagesObject.log.push(latestInput);


  // await db.update(chats)
  //   .set({ messages: JSON.stringify(messagesObject) })
  //   .where(eq(chats.id, Number(params.params.chatid)));


  console.log("data", data)
  // console.log(response.text);
  // console.log("writer", writer)
  // console.log("stream", stream)
  return new NextResponse(await stream.readable)
}

