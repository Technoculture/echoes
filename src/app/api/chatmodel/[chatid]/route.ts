import { StreamingTextResponse, LangChainStream, nanoid } from "ai";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema";
import { CHAT_COMPLETION_CONTENT, ChatEntry, ChatLog } from "@/lib/types";
import { systemPrompt } from "@/utils/prompts";
import {
  chooseModel,
  jsonToLangchain,
  openAIChatModel,
  OPEN_AI_MODELS,
} from "@/utils/apiHelper";
import { NextResponse } from "next/server";
import { env } from "@/app/env.mjs";
import { auth } from "@clerk/nextjs";
import axios from "axios";
export const revalidate = 0; // disable cache

export const maxDuration = 60;

export async function POST(
  request: Request,
  params: { params: { chatid: string } },
) {
  const body = await request.json();
  const { orgSlug } = await auth();
  console.log("orgSlug", orgSlug);

  const _chat = body.messages;
  const isFast = body.isFast;
  let orgId = "";
  orgId = body.orgId;
  const url = request.url;
  // getting main url
  const urlArray = url.split("/");

  let id = params.params.chatid as any;
  // exceptional case
  if (_chat.length === 0) {
    console.error(
      "somehow got the length 0, this shouldn't happen if validating messages length before calling the api",
    );
    return;
  }
  const msgs = jsonToLangchain(_chat, systemPrompt);

  const model = OPEN_AI_MODELS.gpt4Turbo;
  const { error } = chooseModel(isFast, msgs, systemPrompt);

  if (error) {
    const msg = {
      content: CHAT_COMPLETION_CONTENT,
      role: "assistant",
    };
    _chat.push(msg); // pushing the final message to identify that the chat is completed
    await db
      .update(chats)
      .set({
        messages: JSON.stringify({ log: _chat }),
        updatedAt: new Date(),
      })
      .where(eq(chats.id, Number(id)))
      .run();
    return NextResponse.json(
      { ...msg },
      {
        status: 400,
      },
    );
  }

  const postToAlgolia = ({
    chats,
    chatId,
    orgSlug,
  }: {
    chats: ChatEntry[];
    chatId: number;
    orgSlug: string;
  }) => {
    fetch(
      `https://zeplo.to/https://${urlArray[2]}/api/addToSearch?_token=${env.ZEPLO_TOKEN}`,
      {
        method: "POST",
        body: JSON.stringify({ chats, chatId, orgSlug }),
        headers: {
          "x-zeplo-secret": env.ZEPLO_SECRET,
        },
      },
    );
  };

  const { stream, handlers } = LangChainStream({
    onCompletion: async (fullResponse: string) => {
      const latestReponse = {
        id: nanoid(),
        role: "assistant",
        content: fullResponse,
        createdAt: new Date(),
        audio: "",
      };
      console.log("latestReponse", latestReponse);
      if (orgId !== "") {
        // it means it is the first message in a specific chat id
        // Handling organization chat inputs
        if (_chat.length === 1) {
          console.log("got in 1 length case");
          _chat.push(latestReponse);

          axios.post(`https://zeplo.to/step?_token=${env.ZEPLO_TOKEN}`, [
            {
              url: `https://${urlArray[2]}/api/generateTitle/${id}/${orgId}?_step=A`,
              body: JSON.stringify({ chat: _chat }),
              headers: {
                "x-zeplo-secret": env.ZEPLO_SECRET,
              },
            },
            {
              url: `https://${urlArray[2]}/api/addToSearch?_step=B&_requires=A`,
              body: JSON.stringify({
                chats: _chat,
                chatId: Number(id),
                orgSlug: orgSlug as string,
              }),
              headers: {
                "x-zeplo-secret": env.ZEPLO_SECRET,
              },
            },
          ]);
          await db
            .update(chats)
            .set({
              messages: JSON.stringify({ log: _chat } as ChatLog),
            })
            .where(eq(chats.id, Number(id)))
            .run();
        } else {
          _chat.push(latestReponse);
          postToAlgolia({
            chats: [_chat[_chat.length - 2], latestReponse],
            chatId: Number(id),
            orgSlug: orgSlug as string,
          }); // add to search index
          await db
            .update(chats)
            .set({
              messages: JSON.stringify({ log: _chat }),
              updatedAt: new Date(),
            })
            .where(eq(chats.id, Number(id)))
            .run();
        }
      }
    },
  });

  // const azure_chat_model = azureOpenAiChatModel(
  //   OPEN_AI_MODELS.gptTurbo16k,
  //   true,
  //   handlers,
  // ); // here it is type unsafe
  const openai_chat_model = openAIChatModel(model, true, handlers);

  // const modelWithFallback = openai_chat_model.withFallbacks({
  //   fallbacks: [azure_chat_model],
  // });
  // modelWithFallback.invoke(msgs);
  openai_chat_model.call(msgs);
  return new StreamingTextResponse(stream);
}
