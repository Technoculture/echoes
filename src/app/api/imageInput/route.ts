import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage } from "@langchain/core/messages";
import { env } from "@/app/env.mjs";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { saveToDB } from "@/utils/apiHelper";
import { nanoid } from "ai";

const chat = new ChatOpenAI({
  modelName: "gpt-4-vision-preview",
  maxTokens: 1024,
  openAIApiKey: env.OPEN_AI_API_KEY,
});

export async function POST(request: Request) {
  let formData = await request.formData();

  const { orgSlug } = await auth();
  console.log("orgSlug", orgSlug);
  const urlArray: any = request.url;
  const chatId: any = formData.get("chatId");
  const orgId: any = formData.get("orgId");
  const userId: any = formData.get("userId");
  const message02: any = formData.get("message02");

  console.log("urlllll", request.url);
  if (!formData || !formData.has("file")) {
    return NextResponse.json(
      { result: "no data received", success: false },
      { status: 400 },
    );
  }

  const file = formData.get("file");
  const imageInput: any = formData.get("imageInput");
  if (file) {
    const blob = file as Blob;
    const buffer = Buffer.from(await blob.arrayBuffer());
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
    if (res) {
      const latestReponse = {
        id: nanoid(),
        role: "assistant" as const,
        content: typeof res === "string" ? res : JSON.stringify(res),
        createdAt: new Date(),
        audio: "",
      };
      await saveToDB({
        _chat: message02,
        chatId: chatId,
        orgSlug: orgSlug as string,
        latestResponse: latestReponse,
        userId: userId,
        orgId: orgId,
        urlArray: urlArray,
      });
      return NextResponse.json({ result: res, success: true }, { status: 200 });
    }
  } else {
    return NextResponse.json(
      { result: "Invalid file data", success: false },
      { status: 400 },
    );
  }
}
