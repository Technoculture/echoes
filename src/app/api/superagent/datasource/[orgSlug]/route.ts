import { NextResponse } from "next/server";
import { SuperAgentClient } from "superagentai-js";
import { env } from "@/app/env.mjs";
import { addToDatasourceSchema } from "@/lib/types";
const client = new SuperAgentClient({
  environment: "https://api.beta.superagent.sh",
  token: env.SUPERAGENT_API_KEY,
});

// create datasource
export async function POST(
  request: Request,
  params: { params: { orgSlug: string } },
) {
  const orgSlug = params.params.orgSlug;
  const body = addToDatasourceSchema.parse(await request.json());

  const requestUrl = request.url;
  const urlArray = requestUrl.split("/");

  const { description, name, type, url } = body;
  try {
    console.info("reached before datasource creation");
    console.log(
      "description",
      orgSlug,
      description,
      "name",
      name,
      "type",
      type,
      "url",
      url,
    );
    // create datasource
    const { data: datasource } = await client.datasource.create({
      name: orgSlug + "_" + name,
      description: description,
      type: "PDF",
      url: url,
    });
    console.info("reached after datasource creation", datasource);

    // get org's agent
    const { data: agents } = await client.agent.list();
    const agent = agents!.find((agent) => agent.name === orgSlug);

    // add datasource to agent
    const result = await fetch(
      `https://zeplo.to/https://${urlArray[2]}/api/superagent/agents/${agent?.id}datasources/add?_token=${env.ZEPLO_TOKEN}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-zeplo-secret": env.ZEPLO_SECRET,
        },
        body: JSON.stringify({
          datasourceId: datasource!.id,
        }),
      },
    );

    return NextResponse.json({
      status: "ok",
      message: "create datasource",
      datasource,
    });
  } catch (error) {
    console.error("error creating datasource", error);
    return NextResponse.json({ status: "error", error }, { status: 400 });
  }
}

// get datasource
export async function GET(
  request: Request,
  params: { params: { orgSlug: string } },
) {
  // orgSlug should contain the full name of the datasource
  const orgSlug = params.params.orgSlug;

  // list datasources
  const { data: datasources } = await client.datasource.list();

  // find datasource by name
  const datasource = datasources!.find(
    (datasource) => datasource.name === orgSlug,
  );

  // return error if datasource not found
  if (datasource === undefined) {
    return NextResponse.json(
      { status: "error", message: "datasource not found" },
      { status: 404 },
    );
  }

  // // get datasource
  // const { data: fetchedDataSource } = await client.datasource.get(datasource!.id);

  return NextResponse.json({
    status: "ok",
    message: "get datasource",
    datasource,
  });
}

// delete datasource
export async function DELETE(
  request: Request,
  params: { params: { orgSlug: string } },
) {
  // in this case the orgSlug should contain the full name of the datasource
  const orgSlug = params.params.orgSlug;

  // list datasources
  const { data: datasources } = await client.datasource.list();

  // find datasource by name
  const datasource = datasources!.find(
    (datasource) => datasource.name === orgSlug,
  )!;

  // return error if datasource not found
  if (datasource === undefined) {
    return NextResponse.json(
      { status: "error", message: "datasource not found" },
      { status: 404 },
    );
  }

  // delete datasource
  const retVal = await client.datasource.delete(datasource.id);

  console.log("return value on datasource deletion", retVal);

  return NextResponse.json({
    status: "ok",
    message: "delete datasource",
    deletedDatasource: datasource,
  });
}
