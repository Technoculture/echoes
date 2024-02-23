import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage } from "@langchain/core/messages";
import { env } from "@/app/env.mjs";
import { NextResponse } from "next/server";
import { saveDroppedImage } from "@/utils/apiHelper";
import { jsonToLangchain, saveToDB } from "@/utils/apiHelper";
import { systemPrompt } from "@/utils/prompts";
import { z } from "zod";
import { Message } from "ai/react/dist";
import { auth } from "@clerk/nextjs";

const dropZoneInputSchema = z.object({
  imageName: z.string(),
  imageType: z.string(),
  imageSize: z.number(),
  value: z.string(),
  userId: z.string(),
  orgId: z.string(),
  chatId: z.any(),
  id: z.string(),
  imageFile: z.any(),
  messages: z.any(),
});
const chat = new ChatOpenAI({
  modelName: "gpt-4-vision-preview",
  maxTokens: 1024,
  openAIApiKey: env.OPEN_AI_API_KEY,
});

export async function POST(request: Request) {
  const formData = await request.formData();
  const zodMessageString: any = formData.get("zodMessage");
  const file: any = formData.get("file");
  const zodMessageObject = JSON.parse(zodMessageString);

  const zodMessage = dropZoneInputSchema.parse({
    imageName: zodMessageObject.data.imageName,
    imageType: zodMessageObject.data.imageType,
    imageSize: zodMessageObject.data.imageSize,
    value: zodMessageObject.data.value,
    userId: zodMessageObject.data.userId,
    orgId: zodMessageObject.data.orgId,
    chatId: zodMessageObject.data.chatId,
    id: zodMessageObject.data.id,
    imageFile: file,
    messages: zodMessageObject.data.message as Message[],
  });

  // console.log("zodMessage:", zodMessage);

  const {
    imageName,
    imageType,
    imageSize,
    value,
    userId,
    orgId,
    chatId,
    id,
    messages,
    imageFile,
  } = zodMessage;
  const { orgSlug } = await auth();

  const _message = messages as unknown as Message[];
  console.log("_message", _message);
  const url = request.url;
  const urlArray = url.split("/");

  if (!formData || !formData.has("file")) {
    return NextResponse.json(
      { result: "no data received", success: false },
      { status: 400 },
    );
  }
  const parts = imageFile.name.split(".");
  const extension = parts[parts.length - 1];

  // console.log("messages",messages)
  const msgs: any = jsonToLangchain(messages, systemPrompt);

  console.log("msgs", msgs);

  if (file && zodMessage) {
    const blob = file as Blob;
    const buffer = Buffer.from(await blob.arrayBuffer());
    const imageBase64 = buffer.toString("base64");
    const message = new HumanMessage({
      content: [
        {
          type: "text",
          text: value,
        },
        {
          type: "image_url",
          image_url: `data:image/png;base64,${imageBase64}`,
        },
      ],
    });
    const res = await Promise.race([
      chat.invoke([message]),
      new Promise((resolve, reject) => {
        setTimeout(() => reject(new Error("Timeout occurred")), 50000);
      }),
    ]).catch((error) => {
      console.error("Error:", error);
      return null; // Handle the timeout error appropriately
    });
    console.log("Image response", res);
    if (res) {
      const latestReponse = {
        id: id,
        role: "assistant" as const,
        content: typeof res === "string" ? res : JSON.stringify(res),
        createdAt: new Date(),
        audio: "",
      };
      const db = await saveToDB({
        _chat: _message,
        chatId: chatId,
        orgSlug: orgSlug as string,
        latestResponse: latestReponse,
        userId: userId,
        orgId: orgId,
        urlArray: urlArray,
      });
      console.log("dbResponce", db);

      const saveDroppedImag = await saveDroppedImage({
        imageId: zodMessageObject.data.id,
        buffer: buffer,
        chatId: zodMessageObject.data.chatId,
        imageExtension: extension,
        imageName: file.name,
      });

      return NextResponse.json(
        { result: res, imageUrl: saveDroppedImag, success: true },
        { status: 200 },
      );
    }
  } else {
    return NextResponse.json(
      { result: "Invalid file data", success: false },
      { status: 400 },
    );
  }
}
