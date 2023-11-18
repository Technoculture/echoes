import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema";
import { CHAT_COMPLETION_CONTENT, ChatEntry } from "@/lib/types";
import { systemPrompt } from "@/utils/prompts";
import {
  chooseModel,
  jsonToLangchain,
  // generateTitle,
  openAIChatModel,
  OPEN_AI_MODELS,
} from "@/utils/apiHelper";
import { Calculator } from "langchain/tools/calculator";
import { NextResponse } from "next/server";
import { SerpAPI } from "langchain/tools";
import { initializeAgentExecutorWithOptions } from "langchain/agents";
import { BufferMemory, ChatMessageHistory } from "langchain/memory";
import { StreamingTextResponse, nanoid } from "ai";
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

  let id = params.params.chatid as string;
  // exceptional case
  if (_chat.length === 0) {
    console.error(
      "somehow got the length 0, this shouldn't happen if validating messages length before calling the api",
    );
    return;
  }
  const msgs = jsonToLangchain(_chat, systemPrompt);

  const model = OPEN_AI_MODELS.gpt4Turbo;
  const { error } = chooseModel(isFast, msgs, systemPrompt);

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

  const encoder = new TextEncoder();
  let ctrl: ReadableStreamDefaultController<any>;
  const readableStream = new ReadableStream({
    start(controller) {
      ctrl = controller;
    },
  });

  const tools = [new SerpAPI(apiKey), new Calculator()];
  const openai_chat_model = openAIChatModel(model, true);
  const executor = await initializeAgentExecutorWithOptions(
    tools,
    openai_chat_model,
    {
      agentType: "openai-functions",
      memory: new BufferMemory({
        memoryKey: "chat_history",
        chatHistory: new ChatMessageHistory(msgs.slice(0, -1)),
        returnMessages: true,
        outputKey: "output",
      }),
      returnIntermediateSteps: true,
      maxIterations: 10,
    },
  );

  const intermediateSteps = [] as AgentStep[];
  let toolResponse: AgentStep = {} as AgentStep;
  let assistantReply = "";

  executor.call({ input: msgs[msgs.length - 1].content }, [
    {
      async handleToolStart(
        tool,
        input,
        runId,
        parentRunId,
        tags,
        metadata,
        name,
      ) {
        console.log("handleToolStart tool", tool);
        console.log("handleToolStart input", input);
      },
      async handleToolEnd(output, runId, parentRunId, tags) {
        toolResponse.observation = output;
        intermediateSteps.push(toolResponse); // managing intermediate steps
        const obj = JSON.stringify(toolResponse);
        // ctrl.enqueue(encoder.encode(obj)); // sending tool output to stream
        ctrl.enqueue(encoder.encode(`$__JSON_START__${obj}__JSON_END__`)); // sending tool output to stream
        ctrl.enqueue(`\n\n`); // sending tool output to stream
        toolResponse = {} as AgentStep;
      },
      async handleAgentAction(action, runId, parentRunId, tags) {
        toolResponse.action = action;
        console.log("handleAgentAction action", action);
      },
      async handleAgentEnd(action, runId, parentRunId, tags) {
        console.log("agent ended 1 assistantReply", assistantReply);
      },
      async handleLLMStart(
        llm,
        prompts,
        runId,
        parentRunId,
        extraParams,
        tags,
        metadata,
        name,
      ) {
        console.log("llm started", prompts);
      },
      async handleLLMNewToken(token, idx, runId, parentRunId, tags, fields) {
        assistantReply += token;
        ctrl.enqueue(encoder.encode(token));
      },
      async handleLLMEnd(output, runId, parentRunId, tags) {
        console.log("llm ended with output", output);
      },
      async handleChatModelStart(
        llm,
        messages,
        runId,
        parentRunId,
        extraParams,
        tags,
        metadata,
        name,
      ) {
        // console.log("chatModelStart", messages)
      },
      handleChainStart(
        chain,
        inputs,
        runId,
        parentRunId,
        tags,
        metadata,
        runType,
        name,
      ) {
        console.log("chain started", chain, inputs);
      },
      async handleChainEnd(output, runId, parentRunId, tags, runType) {
        const intermediateStepMessages: ChatEntry[] = (
          output.intermediateSteps ?? []
        ).map((intermediateStep: AgentStep, i: number) => {
          return {
            id: nanoid(),
            content: JSON.stringify(intermediateStep),
            role: "function",
          } as ChatEntry;
        });

        const assistantMessage = {
          id: nanoid(),
          role: "assistant",
          content: output.output,
        } as ChatEntry;

        const messages = [...intermediateStepMessages, assistantMessage];
        // append to _chat and save to db
        _chat.push(...intermediateStepMessages, assistantMessage);
        await db
          .update(chats)
          .set({
            messages: JSON.stringify({ log: _chat }),
            updatedAt: new Date(),
          })
          .where(eq(chats.id, Number(id)))
          .run();
        ctrl.close();
      },
    },
  ]);

  return new StreamingTextResponse(readableStream);
}
