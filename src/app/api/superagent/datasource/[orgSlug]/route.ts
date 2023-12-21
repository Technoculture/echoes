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

  const { description, name, type, url } = body;
  // create datasource
  const { data: datasource } = await client.datasource.create({
    name: orgSlug + "_" + name,
    description,
    type,
    url,
  });

  return NextResponse.json({
    status: "ok",
    message: "create datasource",
    datasource,
  });
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
