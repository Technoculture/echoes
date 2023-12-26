import { SuperAgentClient } from "superagentai-js";
import { env } from "@/app/env.mjs";

export async function getStreamFromAgent(agentId: string, input: string) {
  const client = new SuperAgentClient({
    environment: "https://api.beta.superagent.sh",
    token: env.SUPERAGENT_API_KEY,
  });

  // const res = await client.agent.invoke(agent!.id, {
  //   enableStreaming: true,
  //   input: input
  // });

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
