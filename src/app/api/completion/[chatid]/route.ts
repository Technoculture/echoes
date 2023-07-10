import { OpenAI } from "langchain/llms/openai";
//import { CallbackManager } from "langchain/callbacks";
import { NextResponse } from "next/server";
import { env } from "@/app/env.mjs";

export const revalidate = 0; // disable cache

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  let chat_req: string | null = searchParams.get("query");

  if (chat_req === null) {
    return new NextResponse();
  }

  //const res = new NextResponse();
  //const handleNewToken = (token: string) => {
  //  console.log("new token", token);
  //};

  const llm = new OpenAI({
    temperature: 0.5,
    openAIApiKey: env.OPEN_AI_API_KEY,
    //streaming: true,
    //callbackManager: CallbackManager.fromHandlers({
    //    async handleLLMNewToken(token) {
    //      handleNewToken(token);
    //    },
    //  }),
  });

  const response = await llm.call(
    "REPY IN SHORT AS A CHATBOT TO THE FOLLOWING MESSAGE FROM THE USER. USER: " +
      chat_req,
  );

  //console.log(response);
  return new NextResponse(JSON.stringify(response));
}
