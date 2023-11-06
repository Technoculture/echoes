import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema";
import { CHAT_COMPLETION_CONTENT, ChatEntry, ChatLog } from "@/lib/types";
import { systemPrompt } from "@/utils/prompts";
import {
  chooseModel,
  jsonToLangchain,
  generateTitle,
  openAIChatModel,
} from "@/utils/apiHelper";
import { Calculator } from "langchain/tools/calculator";
import { NextResponse } from "next/server";
import { SerpAPI } from "langchain/tools";
import { initializeAgentExecutorWithOptions } from "langchain/agents";
import { BufferMemory, ChatMessageHistory } from "langchain/memory";
import { AgentStep } from "langchain/schema";
const apiKey = process.env.SERP_API_KEY;
export const maxDuration = 60; // This function can run for a maximum of 5 seconds
export const dynamic = "force-dynamic";

export const revalidate = 0; // disable cache

export async function POST(
  request: Request,
  params: { params: { chatid: string } },
) {
  const body = await request.json();

  const _chat = body.messages as ChatEntry[];
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
    _chat.push(msg as ChatEntry); // pushing the final message to identify that the chat is completed
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

  const tools = [new SerpAPI(apiKey), new Calculator()];
  const openai_chat_model = openAIChatModel(model, false);
  const executor = await initializeAgentExecutorWithOptions(
    tools,
    openai_chat_model,
    {
      // agentType: "chat-conversational-react-description",
      agentType: "openai-functions",
      memory: new BufferMemory({
        memoryKey: "chat_history",
        chatHistory: new ChatMessageHistory(msgs.slice(0, -1)),
        returnMessages: true,
        outputKey: "output",
      }),
      returnIntermediateSteps: true,
    },
  );

  const data = await executor.call({ input: msgs[msgs.length - 1].content });

  const intermediateStepMessages = (data.intermediateSteps ?? []).map(
    (intermediateStep: AgentStep) => {
      return { content: JSON.stringify(intermediateStep), role: "function" };
    },
  ) as ChatEntry[];
  const functionMessage = {
    role: "assistant",
    content: data.output,
  } as ChatEntry;
  const titleSystemMessage = {
    role: "system",
    content:
      "Generate a clear, compact and precise title based on the below conversation in the form of Title:Description",
  } as ChatEntry;

  try {
    if (_chat.length === 1) {
      console.log("got in 1 length case");
      const chatCopy = structuredClone(_chat.slice(1));
      chatCopy.push(functionMessage);
      chatCopy.unshift(titleSystemMessage);
      const title = await generateTitle(chatCopy);
      console.log("generated title", title);
      _chat.push(...intermediateStepMessages, functionMessage);
      await db
        .update(chats)
        .set({
          messages: JSON.stringify({ log: _chat } as ChatLog),
          title: title,
        })
        .where(eq(chats.id, Number(id)))
        .run();
    } else {
      await db
        .update(chats)
        .set({
          messages: JSON.stringify({ log: _chat }),
          updatedAt: new Date(),
        })
        .where(eq(chats.id, Number(id)))
        .run();
    }
    return new Response(JSON.stringify(data));
  } catch (err) {
    return new Response(undefined, { status: 400 });
  }

  console.log("this is data", data);
  console.info("info", openai_chat_model.lc_kwargs);
}
