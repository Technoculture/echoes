import { StreamingTextResponse, LangChainStream } from "ai";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema";
import { CHAT_COMPLETION_CONTENT, ChatEntry, ChatLog } from "@/lib/types";
import { systemPrompt } from "@/utils/prompts";
import {
  chooseModel,
  jsonToLangchain,
  generateTitle,
  openAIChatModel,
  OPEN_AI_MODELS,
  generateChatImage,
} from "@/utils/apiHelper";
import { NextResponse } from "next/server";
export const revalidate = 0; // disable cache

export async function POST(
  request: Request,
  params: { params: { chatid: string } },
) {
  const body = await request.json();

  const _chat = body.messages;
  const isFast = body.isFast;
  let orgId = "";
  orgId = body.orgId;

  let id = params.params.chatid as any;
  // exceptional case
  if (_chat.length === 0) {
    console.error(
      "somehow got the length 0, this shouldn't happen if validating messages length before calling the api",
    );
    return;
  }
  const msgs = jsonToLangchain(_chat, systemPrompt);
  console.log("msgs", msgs[0]);

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

  const { stream, handlers } = LangChainStream({
    onCompletion: async (fullResponse: string) => {
      const latestReponse = { role: "assistant", content: fullResponse };
      if (orgId !== "") {
        // it means it is the first message in a specific chat id
        // Handling organization chat inputs
        if (_chat.length === 1) {
          console.log("got in 1 length case");
          _chat.push(latestReponse);
          const title = await generateTitle(_chat as ChatEntry[]);
          const imageUrl = await generateChatImage(title, id as string);
          // popping up because inserted the prompt for generating the title so removing the title prompt
          _chat.pop();
          console.log("generated title", title);
          await db
            .update(chats)
            .set({
              messages: JSON.stringify({ log: _chat } as ChatLog),
              title: title,
              image_url: imageUrl,
            })
            .where(eq(chats.id, Number(id)))
            .run();
        } else {
          _chat.push(latestReponse);
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
      // handling user's personal chat
      //  else {
      //   // it means it is the first message in a specific chat id
      //   if (_chat.length === 1) {
      //     _chat.push(latestReponse);
      //     await db.insert(chats).values({
      //       user_id: String(userId),
      //       messages: JSON.stringify({ log: _chat } as ChatLog),
      //     });
      //   } else {
      //     _chat.push(latestReponse);
      //     await db
      //       .update(chats)
      //       .set({ messages: JSON.stringify({ log: _chat }) })
      //       .where(eq(chats.id, Number(id)));
      //   }
      // }
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
  console.info("info", openai_chat_model.lc_kwargs);
  return new StreamingTextResponse(stream);
}
