import { StreamingTextResponse, LangChainStream } from "ai";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema";
import { CHAT_COMPLETION_CONTENT, ChatEntry, ChatLog } from "@/lib/types";
import { systemPrompt } from "@/utils/prompts";
import {
  chooseModel,
  jsonToLangchain,
  generateTitle,
  // azureOpenAiChatModel,
  // OPEN_AI_MODELS,
  openAIChatModel,
} from "@/utils/apiHelper";
import { Calculator } from "langchain/tools/calculator";
import { NextResponse } from "next/server";
import { SerpAPI } from "langchain/tools";
import { initializeAgentExecutorWithOptions } from "langchain/agents";
import { BufferMemory, ChatMessageHistory } from "langchain/memory";
const apiKey =
  "1d72abd1addcda2e0cba4c2fa96279ca11af10b43a4c6e21d41ade61cccd0156";

export const revalidate = 0; // disable cache

export async function POST(
  request: Request,
  params: { params: { chatid: string } },
) {
  const body = await request.json();

  const _chat = body.messages;
  const isFast = body.isFast || true;
  let orgId = "";
  orgId = body.orgId;

  let id = params.params.chatid as any;
  // exceptional case
  if (_chat.length === 0) {
    console.error(
      "somehow got the length 0, this shouldn't happen if validating messages length before calling the api",
    );
    return;
  }
  const msgs = jsonToLangchain(_chat, systemPrompt);
  console.log("msgs", msgs[0]);

  const { error, model } = chooseModel(isFast, msgs, systemPrompt);

  if (error) {
    const msg = {
      content: CHAT_COMPLETION_CONTENT,
      role: "assistant",
    };
    _chat.push(msg); // pushing the final message to identify that the chat is completed
    await db
      .update(chats)
      .set({
        messages: JSON.stringify({ log: _chat }),
        updatedAt: new Date(),
      })
      .where(eq(chats.id, Number(id)))
      .run();
    return NextResponse.json(
      { ...msg },
      {
        status: 400,
      },
    );
  }

  const { stream, handlers } = LangChainStream({
    onCompletion: async (fullResponse: string) => {
      const latestReponse = { role: "assistant", content: fullResponse };
      if (orgId !== "") {
        // it means it is the first message in a specific chat id
        // Handling organization chat inputs
        if (_chat.length === 1) {
          console.log("got in 1 length case");
          _chat.push(latestReponse);
          const title = await generateTitle(_chat as ChatEntry[]);
          // popping up because inserted the prompt for generating the title so removing the title prompt
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
        } else {
          _chat.push(latestReponse);
          await db
            .update(chats)
            .set({
              messages: JSON.stringify({ log: _chat }),
              updatedAt: new Date(),
            })
            .where(eq(chats.id, Number(id)))
            .run();
        }
      }
      // handling user's personal chat
      //  else {
      //   // it means it is the first message in a specific chat id
      //   if (_chat.length === 1) {
      //     _chat.push(latestReponse);
      //     await db.insert(chats).values({
      //       user_id: String(userId),
      //       messages: JSON.stringify({ log: _chat } as ChatLog),
      //     });
      //   } else {
      //     _chat.push(latestReponse);
      //     await db
      //       .update(chats)
      //       .set({ messages: JSON.stringify({ log: _chat }) })
      //       .where(eq(chats.id, Number(id)));
      //   }
      // }
    },
    onFinal(completion) {
      console.log(
        "this is the data on the completion of function call",
        completion,
      );
    },
    onToken(token) {
      console.log("this is onToken", token);
    },
    onStart() {
      console.log("this is on start");
    },
  });

  // const azure_chat_model = azureOpenAiChatModel(
  //   OPEN_AI_MODELS.gptTurbo16k,
  //   true,
  //   handlers,
  // ); // here it is type unsafe
  const tools = [
    new SerpAPI(
      apiKey,
      //   {
      //   location: "Austin,Texas,United States",
      //   hl: "en",
      //   gl: "us",
      // }
    ),
    new Calculator(),
  ];
  const openai_chat_model = openAIChatModel(model, false);
  const memory = new BufferMemory({ memoryKey: "chat_history" });
  const executor = await initializeAgentExecutorWithOptions(
    tools,
    openai_chat_model,
    {
      // agentType: "chat-conversational-react-description",
      agentType: "openai-functions",
      memory: new BufferMemory({
        memoryKey: "chat_history",
        chatHistory: new ChatMessageHistory(msgs),
        returnMessages: true,
        outputKey: "output",
      }),
      returnIntermediateSteps: true,
      // verbose: true,
    },
  );

  // const modelWithFallback = openai_chat_model.withFallbacks({
  //   fallbacks: [azure_chat_model],
  // });
  // modelWithFallback.invoke(msgs);
  // openai_chat_model.call(msgs, { tools : [new SerpAPI(apiKey), new Calculator()] });
  const data = await executor.call({ input: msgs[msgs.length - 1].content });
  console.log("this is data", data);
  console.info("info", openai_chat_model.lc_kwargs);
  return new Response(JSON.stringify(data));
}
