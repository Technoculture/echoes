import { encodingForModel, getEncoding } from "js-tiktoken";
import {
  AIMessage,
  AgentStep,
  BaseMessage,
  HumanMessage,
  SystemMessage,
} from "langchain/schema";
import { ChatEntry, ChatLog, Model } from "@/lib/types";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { env } from "@/app/env.mjs";
import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// import { BaseCallbackHandler } from "langchain/dist/callbacks/base";

export const OPEN_AI_MODELS = {
  gpt4: "gpt-4" as const,
  gptTurbo: "gpt-3.5-turbo" as const,
  gptTurbo16k: "gpt-3.5-turbo-16k" as const,
  gpt4Turbo: "gpt-4-1106-preview" as const,
};

const TOKEN_SIZE = {
  gptTurbo: 4000 as const,
  gpt4: 8000 as const,
  gptTurbo16k: 16200 as const,
};

export const chooseModel = (
  isFast: boolean,
  chatHistory: BaseMessage[],
  systemPrompt: string,
): {
  error: boolean;
  model: string | undefined;
} => {
  const encoding = getEncoding("cl100k_base");
  const enc = encodingForModel("gpt-4");
  const txt = enc.encode(
    chatHistory.reduce((initial, msg) => initial + msg.content, systemPrompt),
    "all",
  );

  const contextSize = txt.length;

  let model: Model = isFast
    ? OPEN_AI_MODELS.gpt4Turbo
    : OPEN_AI_MODELS.gptTurbo;

  if (contextSize > TOKEN_SIZE.gptTurbo16k) {
    return { error: true, model: undefined };
  } else if (contextSize > TOKEN_SIZE.gpt4) {
    model = OPEN_AI_MODELS.gptTurbo16k;
  } else if (
    contextSize > TOKEN_SIZE.gptTurbo &&
    model === OPEN_AI_MODELS.gptTurbo
  ) {
    model = OPEN_AI_MODELS.gpt4Turbo;
  }
  return { error: false, model };
};

export const jsonToLangchain = (
  chatData: ChatEntry[],
  system?: string,
): BaseMessage[] => {
  let ret: BaseMessage[] = [];
  if (system) {
    ret.push(new SystemMessage(system));
  }

  chatData.forEach((item: ChatEntry) => {
    if (item.hasOwnProperty("role")) {
      if (item.role === "user") {
        ret.push(new HumanMessage(item.content));
      } else if (item.role === "assistant") {
        ret.push(new AIMessage(item.content));
      }
    }
  });
  return ret;
};

export const generateTitle = async (chat: ChatEntry[]): Promise<string> => {
  console.log;
  const FIXED = {
    role: "user",
    content: "GENERATE A TITLE ON THE BASIS OF ABOVE CONVERSATION",
  };
  chat.push(FIXED as ChatEntry);
  const msgs = jsonToLangchain(chat);
  const chatmodel: ChatOpenAI = new ChatOpenAI({
    temperature: 0,
    openAIApiKey: env.OPEN_AI_API_KEY,
  });

  const res = await chatmodel.call(msgs);
  return res.content;
};

// export const azureOpenAiChatModel = (
//   model: string | undefined,
//   streaming: boolean,
//   handlers?: any,
// ): ChatOpenAI => {
//   return new ChatOpenAI({
//     modelName: model,
//     temperature: 0.5,
//     azureOpenAIApiKey: env.AZURE_OPENAI_API_KEY,
//     azureOpenAIApiVersion: env.AZURE_OPENAI_API_VERSION,
//     azureOpenAIApiInstanceName: env.AZURE_OPENAI_API_INSTANCE_NAME,
//     azureOpenAIApiDeploymentName: env.AZURE_OPENAI_API_DEPLOYMENT_NAME,
//     topP: 0.5,
//     streaming: streaming,
//     callbacks: handlers ? [handlers] : [],
//   });
// };

export const openAIChatModel = (
  model: string | undefined,
  streaming: boolean,
  handlers?: any,
): ChatOpenAI => {
  return new ChatOpenAI({
    modelName: model,
    temperature: 0.5,
    topP: 0.5,
    openAIApiKey: env.OPEN_AI_API_KEY,
    streaming: streaming,
    maxRetries: 1,
    callbacks: handlers ? [handlers] : [],
  });
};

export const handleDBOperation = async (
  _chat: ChatEntry[],
  id: string,
  intermediateSteps: AgentStep[],
  assistantReply: string,
) => {
  const intermediateStepMessages = (intermediateSteps ?? []).map(
    (intermediateStep: AgentStep) =>
      ({
        content: JSON.stringify(intermediateStep),
        role: "function",
      }) as ChatEntry,
  ) as ChatEntry[]; // turning into appropriate messages

  // creating assistant message
  const assistantMessage = {
    role: "assistant",
    content: assistantReply,
  } as ChatEntry;
  const titleSystemMessage = {
    role: "system",
    content:
      "Generate a clear, compact and precise title based on the below conversation in the form of Title:Description",
  } as ChatEntry;

  console.log("intermediate Steps", intermediateStepMessages);
  console.log("functionMessage", assistantMessage);
  console.log("titleMessage", titleSystemMessage);

  if (_chat.length === 1) {
    console.log("got in 1 length case");
    const chatCopy = structuredClone(_chat.slice(1));
    chatCopy.push(assistantMessage); // adding assistant message
    chatCopy.unshift(titleSystemMessage); // adding system prompt to generate a title
    const title = await generateTitle(chatCopy);
    console.log("generated title", title);
    _chat.push(...intermediateStepMessages, assistantMessage); // adding intermediateSteps and assitant message to real chat
    await db
      .update(chats)
      .set({
        messages: JSON.stringify({ log: _chat } as ChatLog),
        title: title,
      })
      .where(eq(chats.id, Number(id)))
      .run();
  } else {
    _chat.push(...intermediateStepMessages, assistantMessage);
    await db
      .update(chats)
      .set({
        messages: JSON.stringify({ log: _chat }),
        updatedAt: new Date(),
      })
      .where(eq(chats.id, Number(id)))
      .run();
  }
};
