import { NextResponse } from "next/server";
import { SuperAgentClient } from "superagentai-js";
import { env } from "@/app/env.mjs";

const client = new SuperAgentClient({
  environment: "https://api.beta.superagent.sh",
  token: env.SUPERAGENT_API_KEY,
});

// update an agent
// export async function PATCH(request: Request, params: { params: { agentId: string } }) {
//   const { agentId } = params.params;
//   const body = await request.json();
//   try {
//     // update agent
//     const { data: agent } = await client.agent.update(agentId, body);
//     return NextResponse.json({ status: "ok", agent });
//   } catch (error) {
//     return NextResponse.json({ status: "error", error: error}, {status: 400});
//   }
// }
// delete an agent
export async function DELETE(
  request: Request,
  params: { params: { agentId: string } },
) {
  const { agentId } = params.params;
  try {
    // delete agent
    await client.agent.delete(agentId);
    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.log("error", error);
    return NextResponse.json(
      { status: "error", error: error },
      { status: 400 },
    );
  }
}
