import { encodingForModel, getEncoding } from "js-tiktoken";
import {
  AIMessage,
  AgentStep,
  BaseMessage,
  HumanMessage,
  SystemMessage,
} from "langchain/schema";
import { ChatEntry, ChatLog, Model } from "@/lib/types";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { env } from "@/app/env.mjs";
import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import OpenAI from "openai";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import axios from "axios";

// import { BaseCallbackHandler } from "langchain/dist/callbacks/base";

export const OPEN_AI_MODELS = {
  gpt4: "gpt-4" as const,
  gptTurbo: "gpt-3.5-turbo" as const,
  gptTurbo16k: "gpt-3.5-turbo-16k" as const,
  gpt4Turbo: "gpt-4-1106-preview" as const,
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

  let model: Model = isFast
    ? OPEN_AI_MODELS.gpt4Turbo
    : OPEN_AI_MODELS.gptTurbo;

  if (contextSize > TOKEN_SIZE.gptTurbo16k) {
    return { error: true, model: undefined };
  } else if (contextSize > TOKEN_SIZE.gpt4) {
    model = OPEN_AI_MODELS.gptTurbo16k;
  } else if (
    contextSize > TOKEN_SIZE.gptTurbo &&
    model === OPEN_AI_MODELS.gptTurbo
  ) {
    model = OPEN_AI_MODELS.gpt4Turbo;
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

export const generateTitle = async (chat: ChatEntry[]): Promise<string> => {
  console.log;
  const FIXED = {
    role: "user",
    content: "GENERATE A TITLE ON THE BASIS OF ABOVE CONVERSATION",
  };
  chat.push(FIXED as ChatEntry);
  const msgs = jsonToLangchain(chat);
  const chatmodel: ChatOpenAI = new ChatOpenAI({
    temperature: 0,
    openAIApiKey: env.OPEN_AI_API_KEY,
  });

  const res = await chatmodel.call(msgs);
  return res.content;
};

export async function getBufferFromUrl(openAiUrl: string) {
  const axiosResponse = await axios({
    url: openAiUrl, //your url
    method: "GET",
    responseType: "arraybuffer",
  });
  const data = axiosResponse.data;
  if (!(data instanceof Buffer))
    throw new Error("Axios response should be of type Buffer");

  return data;
}

async function createFolder(
  s3: S3Client,
  Bucket: string | undefined,
  Key: string,
) {
  const command = new PutObjectCommand({ Bucket, Key });
  return s3.send(command);
}
// Create and upload an object to the S3 bucket.
export async function putS3Object(inputParams: {
  s3: S3Client;
  Body: Buffer;
  chatId: string;
}) {
  try {
    const data = await inputParams.s3.send(
      new PutObjectCommand({
        Bucket: env.BUCKET_NAME,
        Body: inputParams.Body,
        Key: `cardimages/${inputParams.chatId}`,
      }),
    );
    console.log(
      "Successfully uploaded object: " + env.BUCKET_NAME ||
        "echoes2" + "/" + `cardimages/${inputParams.chatId}`,
    );
    return data; // For unit tests.
  } catch (err) {
    console.log("Error", err);
  }
}

export const generateChatImage = async (
  chatTitle: string,
  chatId: string,
): Promise<string> => {
  //   const prompt = `
  //   Given a chat between echoes (an ai chatbot for biotech research and a scientist) - GENERATE A COVER PHOTO THUMBNAIL.\n
  // Needs to be a landscape image with a 3x2 aspect ratio.\n
  // Colour scheme: Dark is preferred as the image is to be embedded in a UI with black and dark navy blue along with a vibrant lime green accent.\n
  // NO OTHER COLOURS ALLOWED!\n
  // Low key image with deep blacks.
  // Visual style: can be ultra-realistic 4k, or anime.
  // Not always necessary to show a human being.
  // If a human is being shown, show scientists and never doctors.
  // Always show scientists as Indians - either women in their early 20s or men in their late 40s.
  // Do not make generic images.
  // Try to make it as specific to the user's question as possible!
  // STRIVE TO MAKE HIGHLY SCIENTIFICALLY ACCURATE IMAGES.

  // —-

  // Chat Question:
  // ${chatQuestion}
  // `;

  const prompt2 = `Task: Create a cover photo thumbnail for the scientific topic: "title: ${chatTitle}"

Instructions:
1. The image should visually represent the scientific question in detail.
2. Ensure scientific accuracy is paramount; this is critical.
3. The image should be in a landscape format with a 3:2 aspect ratio.
4. Use a color scheme of dark tones, compatible with a UI featuring black, dark navy blue, slate white, and vibrant lime green accents. No other colors are permitted. Aim for a low-key image with deep blacks.
5. The visual style should be without text, resembling scientific illustrations. Aim for an ultra-realistic 4K quality, akin to visuals in the Nature Journal.
6. Including a human figure is optional. If included, depict scientists, specifically Indian scientists - either women in their early 20s or men in their late 40s. Avoid depicting doctors.

Always find out what the terms mentioned in the title mean before drawing them.`;
  const Openai = new OpenAI({
    apiKey: env.OPEN_AI_API_KEY,
  });
  const s3 = new S3Client({
    region: env.AWS_REGION,
    credentials: {
      accessKeyId: env.AWS_ACCESS_KEY_ID,
      secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
    },
  });

  const response = await Openai.images.generate({
    // need to handle retry logic
    model: "dall-e-3",
    prompt: prompt2,
    n: 1,
    size: "1024x1024",
  });
  console.log("this is the image generation response", response);
  const image_url = response.data[0].url;

  if (image_url) {
    const buffer = await getBufferFromUrl(image_url);

    const putObjectResponse = await putS3Object({
      s3: s3,
      Body: buffer,
      chatId,
    });
    const image_s3_url = `${env.IMAGE_PREFIX_URL}cardimages/${chatId}`;
    console.log("generated image s3 url", image_s3_url);
    return image_s3_url;
  }
  return image_url || "";
};

// export const azureOpenAiChatModel = (
//   model: string | undefined,
//   streaming: boolean,
//   handlers?: any,
// ): ChatOpenAI => {
//   return new ChatOpenAI({
//     modelName: model,
//     temperature: 0.5,
//     azureOpenAIApiKey: env.AZURE_OPENAI_API_KEY,
//     azureOpenAIApiVersion: env.AZURE_OPENAI_API_VERSION,
//     azureOpenAIApiInstanceName: env.AZURE_OPENAI_API_INSTANCE_NAME,
//     azureOpenAIApiDeploymentName: env.AZURE_OPENAI_API_DEPLOYMENT_NAME,
//     topP: 0.5,
//     streaming: streaming,
//     callbacks: handlers ? [handlers] : [],
//   });
// };

export const openAIChatModel = (
  model: string | undefined,
  streaming: boolean,
  handlers?: any,
): ChatOpenAI => {
  return new ChatOpenAI({
    modelName: model,
    temperature: 0.5,
    topP: 0.5,
    openAIApiKey: env.OPEN_AI_API_KEY,
    streaming: streaming,
    maxRetries: 1,
    callbacks: handlers ? [handlers] : [],
  });
};

export const handleDBOperation = async (
  _chat: ChatEntry[],
  id: string,
  intermediateSteps: AgentStep[],
  assistantReply: string,
) => {
  const intermediateStepMessages = (intermediateSteps ?? []).map(
    (intermediateStep: AgentStep) =>
      ({
        content: JSON.stringify(intermediateStep),
        role: "function",
      }) as ChatEntry,
  ) as ChatEntry[]; // turning into appropriate messages

  // creating assistant message
  const assistantMessage = {
    role: "assistant",
    content: assistantReply,
  } as ChatEntry;
  const titleSystemMessage = {
    role: "system",
    content:
      "Generate a clear, compact and precise title based on the below conversation in the form of Title:Description",
  } as ChatEntry;

  console.log("intermediate Steps", intermediateStepMessages);
  console.log("functionMessage", assistantMessage);
  console.log("titleMessage", titleSystemMessage);

  if (_chat.length === 1) {
    console.log("got in 1 length case");
    const chatCopy = structuredClone(_chat.slice(1));
    chatCopy.push(assistantMessage); // adding assistant message
    chatCopy.unshift(titleSystemMessage); // adding system prompt to generate a title
    const title = await generateTitle(chatCopy);
    console.log("generated title", title);
    _chat.push(...intermediateStepMessages, assistantMessage); // adding intermediateSteps and assitant message to real chat
    await db
      .update(chats)
      .set({
        messages: JSON.stringify({ log: _chat } as ChatLog),
        title: title,
      })
      .where(eq(chats.id, Number(id)))
      .run();
  } else {
    _chat.push(...intermediateStepMessages, assistantMessage);
    await db
      .update(chats)
      .set({
        messages: JSON.stringify({ log: _chat }),
        updatedAt: new Date(),
      })
      .where(eq(chats.id, Number(id)))
      .run();
  }
};
