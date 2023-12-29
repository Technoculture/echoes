import { env } from "@/app/env.mjs";
import { NextResponse } from "next/server";
import { SuperAgentClient } from "superagentai-js";
import { PrismaModelsWorkflow } from "superagentai-js/api";
const client = new SuperAgentClient({
  environment: "https://api.beta.superagent.sh",
  token: env.SUPERAGENT_API_KEY,
});

// create workflow
export async function POST(
  request: Request,
  params: { params: { orgSlug: string } },
) {
  const body = await request.json();
  // any more data if required

  const orgSlug = params.params.orgSlug;
  console.log("orgSlug", orgSlug);

  // create workflow
  const { data: workflow } = await client.workflow.create({
    name: orgSlug,
    description: "Workflow for " + orgSlug,
  });

  // list workflows
  // const { data: workflows } = await client.workflow.list();

  // // list agents
  // const { data: agents } = await client.agent.list();

  return NextResponse.json({
    status: "ok",
    orgSlug: orgSlug,
    workflow: workflow,
  });
}

// delete workflow by name
export async function DELETE(
  request: Request,
  params: { params: { orgSlug: string } },
) {
  // any more data if required

  const orgSlug = params.params.orgSlug;
  console.log("orgSlug", orgSlug);

  // list workflows by name
  const { data: workflows } = await client.workflow.list();

  // find workflow by name
  const workflow = workflows!.find(
    (workflow: PrismaModelsWorkflow) => workflow.name === orgSlug,
  );

  // delete workflow
  const retVal = await client.workflow.delete(workflow!.id);

  console.log("return value on workflow delete", retVal);
  return NextResponse.json({
    status: "ok",
    orgSlug: orgSlug,
    workflow: workflow,
    deletedWorkflow: workflow,
  });
}
