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
  let formData = await request.formData();
  if (!formData || !formData.has("file")) {
    return NextResponse.json(
      { result: "no data received", success: false },
      { status: 400 },
    );
  }

  const file = formData.get("file");
  const imageInput: any = formData.get("imageInput");
  if (file && file instanceof File) {
    const buffer = Buffer.from(await file.arrayBuffer());
    const imageBase64 = buffer.toString("base64");
    // console.log("imageBase64", imageBase64);
    // Assuming the API can accept Base64 directly
    const message = new HumanMessage({
      content: [
        {
          type: "text",
          text: imageInput ? imageInput : "what is in this image",
        },
        {
          type: "image_url",
          image_url: `data:image/png;base64,${imageBase64}`,
        },
      ],
    });
    const res = await chat.invoke([message]);
    console.log("Image response", res);
    return NextResponse.json({ result: res, success: true }, { status: 200 });
  } else {
    return NextResponse.json(
      { result: "Invalid file data", success: false },
      { status: 400 },
    );
  }
}
