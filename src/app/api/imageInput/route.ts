import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage } from "@langchain/core/messages";
import { env } from "@/app/env.mjs";
import { NextResponse } from "next/server";
import { jsonToLangchain02, saveDroppedImage } from "@/utils/apiHelper";
import { z } from "zod";
import { Message } from "ai/react/dist";
import { auth } from "@clerk/nextjs";
import { NextApiResponse } from "next";
import { StreamingTextResponse, LangChainStream } from "ai";
import { systemPrompt } from "@/utils/prompts";

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

export async function POST(request: Request, response: NextApiResponse) {
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

  // const _message = messages as unknown as Message[];
  // console.log("_message", _message);
  // const url = request.url;
  // const urlArray = url.split("/");

  if (!formData || !formData.has("file")) {
    return NextResponse.json(
      { result: "no data received", success: false },
      { status: 400 },
    );
  }
  const parts = imageFile.name.split(".");
  const extension = parts[parts.length - 1];
  // console.log("messages", messages)

  const msg: any = jsonToLangchain02(messages, systemPrompt);

  // const str = jsonToLlama(messages);
  // console.log("str", str);

  // const formattedMessages = messages.map((msg: any) => {
  //   return {
  //     role: msg.role,
  //     content: msg.content,
  //   };
  // });
  // // const combinedContent = formattedMessages
  //   .map((msg: any) => msg.content)
  //   .join("\n");
  // const combinedMessage = {
  //   role: "user",
  //   content: combinedContent,
  // };

  const { stream, handlers } = LangChainStream({
    onStart: async () => {
      console.log("On start");
    },
    onToken: async (fullResponse: string) => {
      console.log("onToken", fullResponse);
    },
    onCompletion: async (fullResponse: string) => {
      console.log("onCompletion", fullResponse);
      // const latestReponse = {
      //   id: id,
      //   role: "assistant" as const,
      //   content: fullResponse,
      //   createdAt: new Date(),
      //   audio: "",
      // };
      // const db = await saveToDB({
      //   _chat: _message,
      //   chatId: chatId,
      //   orgSlug: orgSlug as string,
      //   latestResponse: latestReponse,
      //   userId: userId,
      //   orgId: orgId,
      //   urlArray: urlArray,
      // });
      // console.log("dbResponce", db);
    },
  });

  const chat = new ChatOpenAI({
    modelName: "gpt-4-vision-preview",
    maxTokens: 1024,
    streaming: true,
    openAIApiKey: env.OPEN_AI_API_KEY,
  });
  if (file && zodMessage && msg) {
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
    const str = chat
      .call([...msg, message], {}, [handlers])
      .catch(console.error);
    // console.log("Image response", res.content);
    const STR = new StreamingTextResponse(stream);

    if (STR) {
      const saveDroppedImag = await saveDroppedImage({
        imageId: zodMessageObject.data.id,
        buffer: buffer,
        chatId: zodMessageObject.data.chatId,
        imageExtension: extension,
        imageName: file.name,
      });
      // imageUrl = saveDroppedImag
      return new StreamingTextResponse(stream);
    }
  } else {
    return NextResponse.json(
      { result: "Invalid file data", success: false },
      { status: 400 },
    );
  }
  return new StreamingTextResponse(stream);
}
