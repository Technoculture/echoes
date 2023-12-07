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
import { ChatCompletionMessageParam } from "openai/resources";
import { RunTree, RunTreeConfig } from "langsmith";
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
export const jsonToLlama = (chatData: ChatEntry[]): string => {
  let str = `You are An executive summary generator. Given any chat, You will generate for me a point-by-point summary of the key findings and arguments.\n Essentially the whole prompt will be\nGenerate a point-by-point summary of the key findings and arguments in the following conversation between AI <AI> and the user <User>. \n\n The format of the chat is as follows.
<User>...</User>
<AI> … </AI>
<User> … </User>

Here is the chat:\n

`;
  chatData.forEach((item: ChatEntry) => {
    if (item.hasOwnProperty("role")) {
      if (item.role === "user") {
        str += `<User>${item.content}</User>\n`;
      } else if (item.role === "assistant") {
        str += `<AI>${item.content}</AI>\n`;
      }
    }
  });
  str +=
    "\n\n ... \nGiven the chat between ai and human above, Here is an executive summary:\n";
  return str;
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
  chatTitle: string;
}) {
  try {
    const data = await inputParams.s3.send(
      new PutObjectCommand({
        Bucket: env.BUCKET_NAME,
        Body: inputParams.Body,
        Key: `cardimages/${inputParams.chatId}.png`,
        Metadata: {
          "Content-Type": "image/png",
          "chat-id": inputParams.chatId,
          "chat-title": inputParams.chatTitle,
        },
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
  const prompt2 = `Task: Create a low contrast cover photo thumbnail focused on a key concept from the scientific topic ${chatTitle}. The concept should be represented within its biological context in the body or nature.

Instructions
---
Key Concept Visualization: Produce a low contrast, dark image. Incorporate poetic, cinematic blurs to emphasize the key concept in the title, depicted within its relevant biological setting.
Scientific Accuracy: Ensure the image is scientifically accurate and meaningful, focusing exclusively on the most significant word in the topic and its biological implications.
Format and Aspect Ratio: The image should be in a landscape orientation with a 3:2 aspect ratio, suitable for a cover photo thumbnail.
Color Scheme: Employ a palette dominated by deep blacks. Use vibrant lime green sparingly for emphasis. Avoid other colors.
Visual Style: Create a text-free visual resembling high-quality scientific illustrations. Target an ultra-realistic 4K quality, similar to visuals found in the Nature Journal.
Human Element (Optional): You may include human figures. If so, depict Indian scientists engaged in research. Choose between women in their early 20s and men in their late 40s. Avoid representing doctors.
Research and Contextual Understanding: Prior to creating the image, research to understand the terms mentioned in the title, ensuring accurate and contextually relevant depiction.
This approach ensures clarity in representing the scientific topic, maintaining a balance between aesthetic appeal and scientific integrity.`;
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
      chatTitle,
    });
    const image_s3_url = `${env.IMAGE_PREFIX_URL}cardimages/${chatId}.png`;
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

export const saveAudioMessage = async ({
  buffer,
  chatId,
  messageId,
}: {
  buffer: Buffer;
  chatId: string;
  messageId: string;
}): Promise<string> => {
  const s3 = new S3Client({
    region: env.AWS_REGION,
    credentials: {
      accessKeyId: env.AWS_ACCESS_KEY_ID,
      secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
    },
  });
  const data = await s3.send(
    new PutObjectCommand({
      Bucket: env.BUCKET_NAME,
      Body: buffer,
      Key: `chataudio/${chatId}/${messageId}.mp3`,
      Metadata: {
        "Content-Type": "audio/mp4",
        "chat-id": chatId,
        "message-id": messageId,
      },
    }),
  );

  const audioUrl = `${env.IMAGE_PREFIX_URL}chataudio/${chatId}/${messageId}.mp3`;
  return audioUrl;
};

export const summarizeChat = async (chat: ChatEntry[]): Promise<string> => {
  const msgs = chat
    .filter((chat) => ["user", "assistant", "system"].includes(chat.role))
    .map((chat) => ({ role: chat.role, content: chat.content }));
  const msg = jsonToLlama(chat);

  const parentRunConfig: RunTreeConfig = {
    name: "SummarizeChat",
    run_type: "llm",
    inputs: {
      model: "HuggingFaceH4/zephyr-7b-beta",
      messages: msgs as ChatCompletionMessageParam[],
      top_p: 0.7,
      max_tokens: 512,
    },
    serialized: {},
  };
  const parentRun = new RunTree(parentRunConfig);

  const openai = new OpenAI({
    baseURL: env.ANYSCALE_API_BASE,
    apiKey: env.ANYSCALE_API_KEY,
  });
  const stream: OpenAI.Chat.ChatCompletion =
    await openai.chat.completions.create({
      model: "HuggingFaceH4/zephyr-7b-beta",
      messages: [
        { role: "user", content: msg },
      ] as ChatCompletionMessageParam[],
      top_p: 0.7,
      max_tokens: 512,
    });
  console.log("response format", stream);

  await parentRun.end({
    output: stream,
  });
  await parentRun.postRun();
  return stream.choices[0].message.content as string;
};
