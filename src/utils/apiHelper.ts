import { encodingForModel, getEncoding } from "js-tiktoken";
import {
  AIMessage,
  BaseMessage,
  HumanMessage,
  SystemMessage,
} from "langchain/schema";
import { ChatEntry, Model } from "@/lib/types";

const OPEN_AI_MODELS = {
  gpt4: "gpt-4" as const,
  gptTurbo: "gpt-3.5-turbo" as const,
  gptTurbo16k: "gpt-3.5-turbo-16k" as const,
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

  let model: Model = isFast ? OPEN_AI_MODELS.gpt4 : OPEN_AI_MODELS.gptTurbo;

  if (contextSize > TOKEN_SIZE.gptTurbo16k) {
    return { error: true, model: undefined };
  } else if (contextSize > TOKEN_SIZE.gpt4) {
    model = OPEN_AI_MODELS.gptTurbo16k;
  } else if (
    contextSize > TOKEN_SIZE.gptTurbo &&
    model === OPEN_AI_MODELS.gptTurbo
  ) {
    model = OPEN_AI_MODELS.gpt4;
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
