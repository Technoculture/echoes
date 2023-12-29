import { NextResponse } from "next/server";
import { SuperAgentClient } from "superagentai-js";
import { env } from "@/app/env.mjs";

const client = new SuperAgentClient({
  environment: "https://api.beta.superagent.sh",
  token: env.SUPERAGENT_API_KEY,
});

export async function GET(request: Request) {
  // list agents
  const { data: agents } = await client.agent.list();

  try {
    // if(agents){
    //   // find agent by name
    //   const agent = agents.find((agent) => agent.name === "testtest_1");

    //   console.log("found the agent", agent)

    //   // invoke agent through rest api
    //   const response = await fetch(
    //     `https://api.beta.superagent.sh/api/v1/agents/a382a996-91e8-48cf-98a6-7c9a6f054e5c/invoke`,
    //     // `https://api.beta.superagent.sh/api/v1/agents/6ab4d0ec-9a46-4556-a41e-1b388a99c9fd/invoke`,
    //     {
    //       method: "POST",
    //       headers: {
    //         "Content-Type": "application/json",
    //         Authorization: `Bearer ${env.SUPERAGENT_API_KEY}`,
    //       },
    //       body: JSON.stringify({
    //         input: "Hii",
    //         enableStreaming: false,
    //       }),
    //     }
    //   );

    //   const res = await response.json()

    //   console.log("res", res)

    // invoke agent
    // const data = await client.agent.invoke(agent!.id, {
    //   input: "Hii",
    //   enableStreaming: false,
    // });
    // const { data: result } = await client.agent.invoke(agent!.id, {
    //   input: "What is the weather in London?",
    //   enableStreaming: false,
    // });

    // if (data) {
    //   console.log("data", data)
    // }
    return NextResponse.json({ status: "ok", agents });
    // }
  } catch (error) {
    console.log("agents", error);
    return NextResponse.json({ status: "ok", error: error });
  }
}
