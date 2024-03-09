import { StreamingTextResponse, LangChainStream, nanoid, Message } from "ai";
import { chattype } from "@/lib/types";
import { systemPrompt, ellaPrompt } from "@/utils/prompts";
import {
  jsonToLangchain,
  openAIChatModel,
  OPEN_AI_MODELS,
  saveToDB,
} from "@/utils/apiHelper";
import { env } from "@/app/env.mjs";
import { auth } from "@clerk/nextjs";
import { SuperAgentClient } from "superagentai-js";
import { getEventsFromAgent } from "@/utils/superagent/agenthelpers";
import { NextResponse } from "next/server";

export const revalidate = 0; // disable cache

export const maxDuration = 60;

export async function POST(
  request: Request,
  params: { params: { chatid: string } },
) {
  const body = await request.json();
  const { orgSlug } = await auth();
  console.log("orgSlug", orgSlug);

  const _chat = body.messages as Message[];
  let orgId = "";
  orgId = body.orgId;
  const userId = body.userId;
  const url = request.url;
  // getting main url
  const urlArray = url.split("/");

  // getting chat type
  const chatType = chattype.parse(body.chattype);
  const input = _chat[_chat.length - 1].content;
  if (chatType === "rag") {
    const client = new SuperAgentClient({
      environment: "https://api.beta.superagent.sh",
      token: env.SUPERAGENT_API_KEY,
    });

    const { data: agents } = await client.agent.list();
    if (agents) {
      // find agent by name
      const agent = agents.find((agent) => agent.name === orgSlug);
      if (agent) {
        console.log("agent found");
        const stream = await getEventsFromAgent({
          agentId: agent.id,
          input: input,
          _chat: _chat,
          chatId: params.params.chatid,
          orgSlug: orgSlug as string,
          orgId: orgId,
          userId: userId,
          urlArray: urlArray,
        });

        return new NextResponse(stream, {
          headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
          },
        });
      }
    } else {
      console.log("agent not found");
      return NextResponse.json({ error: "agent not fount" }, { status: 404 });
    }
  }

  let id = params.params.chatid as any;
  // exceptional case
  if (_chat.length === 0) {
    console.error(
      "somehow got the length 0, this shouldn't happen if validating messages length before calling the api",
    );
    return;
  }
  const msgs = jsonToLangchain(
    _chat,
    chatType === "ella" ? ellaPrompt : systemPrompt,
  );

  const model = OPEN_AI_MODELS.gpt4Turbo;

  const { stream, handlers } = LangChainStream({
    onCompletion: async (fullResponse: string) => {
      const latestReponse = {
        id: nanoid(),
        role: "assistant" as const,
        content: fullResponse,
        createdAt: new Date(),
        audio: "",
      };
      console.log("latestReponse", latestReponse);
      if (orgId !== "") {
        // it means it is the first message in a specific chat id
        // Handling organization chat inputs
        if (_chat.length === 1) {
          await saveToDB({
            _chat: _chat,
            chatId: Number(id),
            orgSlug: orgSlug as string,
            latestResponse: latestReponse,
            userId: userId,
            orgId: orgId,
            urlArray: urlArray,
          });
        } else {
          await saveToDB({
            _chat: _chat,
            chatId: Number(id),
            orgSlug: orgSlug as string,
            latestResponse: latestReponse,
            userId: userId,
            orgId: orgId,
            urlArray: urlArray,
          });
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
