import { env } from "@/app/env.mjs";
import { ChatEntry } from "@/lib/types";
import { saveToDB } from "@/utils/apiHelper";
import { nanoid } from "ai";

export async function getStreamFromAgent({
  agentId,
  input,
  _chat,
  chatId,
  orgId,
  orgSlug,
  urlArray,
  userId,
}: {
  agentId: string;
  input: string;
  _chat: ChatEntry[];
  chatId: string;
  orgSlug: string;
  orgId: string;
  userId: string;
  urlArray: string[];
}) {
  // text decoder
  const decoder = new TextDecoder();
  const res = await fetch(
    `https://api.beta.superagent.sh/api/v1/agents/${agentId}/invoke`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${env.SUPERAGENT_API_KEY}`,
      },
      body: JSON.stringify({
        input: input,
        enableStreaming: true,
      }),
    },
  );

  const reader = res.body?.getReader();
  const encoder = new TextEncoder();

  let msg = "";
  // write a ReadableStream to the response
  const stream = new ReadableStream({
    async start(controller) {
      while (true) {
        const { done, value } = await reader!.read();
        if (done) {
          console.log("message", msg);
          const latestReponse = {
            id: nanoid(),
            role: "assistant" as const,
            content: msg,
            createdAt: new Date(),
            audio: "",
          };
          await saveToDB({
            _chat: _chat,
            chatId: Number(chatId),
            orgSlug: orgSlug as string,
            latestResponse: latestReponse,
            userId: userId,
            orgId: orgId,
            urlArray: urlArray,
          });
          controller.close();
          break;
        }
        const decoded = decoder.decode(value);
        const lines = decoded.split("\n");
        let parsedLines = lines
          .map((line) => line.replace(/^data: /, ""))
          .filter((line) => line !== "" && line !== "[DONE]");
        console.log("parsedLines", parsedLines.join(""));
        if (!parsedLines.join("").startsWith("event:")) {
          msg += parsedLines.join("");
          controller.enqueue(encoder.encode(parsedLines.join("")));
        }
        // console.log("splitted", splitted.length > 0 ? splitted[1] : null);
        // controller.enqueue(encoder.encode(splitted[1]));
      }
    },
  });

  return stream;
}
