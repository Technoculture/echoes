import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema";
import { ChatEntry, ChatLog } from "@/lib/types";
import {
  OPEN_AI_MODELS,
  // azureOpenAiChatModel,
  jsonToLangchain,
  openAIChatModel,
} from "@/utils/apiHelper";
import { systemPrompt } from "@/utils/prompts";
import { Message } from "ai";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

type regenerateBody = {
  preMessages: Message[];
  postMessages: Message[];
};

export async function POST(
  request: Request,
  params: { params: { chatid: string } },
) {
  const body: regenerateBody = await request.json();
  const chatId = params.params.chatid;
  let preMessages = body.preMessages;
  let postMessages = body.postMessages;

  const msgs = jsonToLangchain(preMessages as ChatEntry[], systemPrompt);

  // const azure_chat_model = azureOpenAiChatModel(
  //   OPEN_AI_MODELS.gptTurbo16k,
  //   false,
  // );

  const openai_chat_model = openAIChatModel(OPEN_AI_MODELS.gpt4, false);

  // const modelWithFallback = openai_chat_model.withFallbacks({
  //   fallbacks: [azure_chat_model],
  // });

  // const answer = await modelWithFallback.invoke(msgs);
  const answer = await openai_chat_model.call(msgs);

  const updatedAIResponse = {
    role: "assistant",
    content: answer.content,
  };

  console.log("updatedAIResponse", updatedAIResponse);

  const updatedChatLog = [...preMessages, updatedAIResponse, ...postMessages];

  try {
    await db
      .update(chats)
      .set({
        messages: JSON.stringify({ log: updatedChatLog } as ChatLog),
      })
      .where(eq(chats.id, Number(chatId)))
      .run();
    return NextResponse.json(
      { updatedMessages: updatedChatLog },
      { status: 200 },
    );
  } catch (err) {
    console.log(err);
    return NextResponse.json({ message: "try again" }, { status: 400 });
  }
}
