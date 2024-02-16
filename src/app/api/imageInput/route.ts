import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage } from "@langchain/core/messages";
import { env } from "@/app/env.mjs";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { saveDroppedImage } from "@/utils/apiHelper";
import { Message } from "ai/react/dist";

const chat = new ChatOpenAI({
  modelName: "gpt-4-vision-preview",
  maxTokens: 1024,
  openAIApiKey: env.OPEN_AI_API_KEY,
});

export async function POST(request: Request) {
  let formData = await request.formData();
  const { orgSlug } = await auth();
  const url: any = request.url;
  const urlArray = url.split("/") as string[];
  const chatId: any = formData.get("chatId");
  const messageId = formData.get("messageId");
  const orgId = formData.get("orgId") as string;
  const userId = formData.get("userId") as string;
  const message02 = formData.get("message02") as unknown as Message[];
  // const message02Array = JSON.parse(message02)
  // console.log("messageId",message02Array)

  if (!formData || !formData.has("file")) {
    return NextResponse.json(
      { result: "no data received", success: false },
      { status: 400 },
    );
  }

  const file: any = formData.get("file");
  const parts = file.name.split(".");
  const extension = parts[parts.length - 1];
  // console.log("fileNameeeeee", file.name);
  // console.log("fileNameeeeee", extension);

  const imageInput: any = formData.get("imageInput");
  if (file) {
    const blob = file as Blob;
    const buffer = Buffer.from(await blob.arrayBuffer());
    const imageBase64 = buffer.toString("base64");
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
    const res = await Promise.race([
      chat.invoke([message]),
      new Promise((resolve, reject) => {
        setTimeout(() => reject(new Error("Timeout occurred")), 30000); // Adjust the timeout value (in milliseconds) as needed
      }),
    ]).catch((error) => {
      console.error("Error:", error);
      return null; // Handle the timeout error appropriately
    });
    console.log("Image response", res);
    if (res) {
      // const latestReponse = {
      //   id: nanoid(),
      //   role: "assistant" as const,
      //   content: typeof res === "string" ? res : JSON.stringify(res),
      //   createdAt: new Date(),
      //   audio: "",

      // };
      // const db = await saveToDB({
      //   _chat: message02,
      //   chatId: chatId,
      //   orgSlug: orgSlug as string,
      //   latestResponse: latestReponse,
      //   userId: userId,
      //   orgId: orgId,
      //   urlArray: urlArray,
      // });
      // console.log("dbbbbbbb", db);
      // const postToAlgoli = await postToAlgolia({
      //   chats: message02,
      //   chatId: chatId,
      //   orgSlug: orgSlug as string,
      //   urlArray: urlArray,
      // });
      // console.log("postToAlgoli", postToAlgoli);
      const saveDroppedImag = await saveDroppedImage({
        imageId: messageId,
        buffer: buffer,
        chatId: chatId,
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
