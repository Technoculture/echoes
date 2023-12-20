import { env } from "@/app/env.mjs";
import { S3Client } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";
import { listContents } from "@/utils/apiHelper";
import { auth } from "@clerk/nextjs";

export async function GET(request: Request) {
  const url = new URL(request.url);

  const prefix = url.searchParams.get("prefix");
  console.log("prefix", prefix);

  const { orgSlug } = await auth();
  const s3Client = new S3Client({
    region: env.AWS_REGION,
    credentials: {
      accessKeyId: env.AWS_ACCESS_KEY_ID,
      secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
    },
  });

  const data = await listContents({
    prefix: prefix ? prefix : orgSlug ? orgSlug + "/" : "",
    s3Client,
  });
  return NextResponse.json({ data: data.tasks });
}
