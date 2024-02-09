import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage } from "@langchain/core/messages";
import { env } from "@/app/env.mjs";
import { NextResponse } from "next/server";

const chat = new ChatOpenAI({
  modelName: "gpt-4-vision-preview",
  maxTokens: 1024,
  openAIApiKey: env.OPEN_AI_API_KEY,
});

export async function POST(request: Request) {
  // let payload = request;
  // console.log("image api fetch", payload);
  // if (!payload) {
  //     return NextResponse.json({ result: "no data get", success: false }, { status: 400 })
  // }
  // else {
  try {
    const body = request.body;
    console.log("body image data", body);
    const file: any = body;
    const reader = new FileReader();

    reader.onload = async () => {
      const imageBase64: any = reader.result;
      console.log("imagebase64", imageBase64);

      const message = new HumanMessage({
        content: [
          {
            type: "text",
            text: "What's in this image?",
          },
          {
            type: "image_url",
            image_url: imageBase64,
          },
        ],
      });
      const res = await chat.invoke([message]);
      console.log("Imageresponse", res);
      return NextResponse.json({ result: res, success: true }, { status: 200 });
    };
    reader.readAsDataURL(file);
  } catch (error) {
    return NextResponse.json(
      { result: error, success: false },
      { status: 400 },
    );
  }
  // }
}
