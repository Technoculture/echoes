import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema";
import { ChatEntry, ChatLog } from "@/lib/types";
import { jsonToLangchain } from "@/utils/apiHelper";
import { Message } from "ai";
import { eq } from "drizzle-orm";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { NextResponse } from "next/server";
import { env } from "process";

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
  console.log("preMessages", preMessages);
  console.log("postMessages", postMessages);

  const msgs = jsonToLangchain(preMessages as ChatEntry[]);

  const chatmodelazure: ChatOpenAI = new ChatOpenAI({
    modelName: "gpt-3.5-turbo-16k",
    temperature: 0.5,
    azureOpenAIApiKey: env.AZURE_OPENAI_API_KEY,
    azureOpenAIApiVersion: env.AZURE_OPENAI_API_VERSION,
    azureOpenAIApiInstanceName: env.AZURE_OPENAI_API_INSTANCE_NAME,
    azureOpenAIApiDeploymentName: env.AZURE_OPENAI_API_DEPLOYMENT_NAME,
    topP: 0.5,
  });
  // change model type based on isFast variable and OPEN_AI_API_KEY as well
  const chatmodel: ChatOpenAI = new ChatOpenAI({
    modelName: "gpt-3.5-turbo-16k",
    temperature: 0.5,
    topP: 0.5,
    openAIApiKey: env.OPEN_AI_API_KEY,
    streaming: true,
    maxRetries: 0,
  });
  const modelWithFallback = chatmodel.withFallbacks({
    fallbacks: [chatmodelazure],
  });

  const answer = await modelWithFallback.invoke(msgs);

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
