import { env } from "@/app/env.mjs";
import { Task } from "@/assets/data/schema";
import {
  GetObjectCommand,
  ListObjectsV2Command,
  S3Client,
} from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  params: { params: { prefix: string } },
) {
  const prefix = params.params.prefix;

  const s3Client = new S3Client({
    region: env.AWS_REGION,
    credentials: {
      accessKeyId: env.AWS_ACCESS_KEY_ID,
      secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
    },
  });

  const data = await listContents({ prefix: "", s3Client });
  return NextResponse.json({ data });
}

async function listContents({
  s3Client,
  prefix,
}: {
  s3Client: S3Client;
  prefix: string;
}) {
  console.debug("Retrieving data from AWS SDK");
  const data = await s3Client.send(
    new ListObjectsV2Command({
      Bucket: process.env.BUCKET_NAME,
      Prefix: prefix,
      Delimiter: "/",
      MaxKeys: 100,
    }),
  );

  const promises = data.Contents?.map((object) => {
    const params = {
      Bucket: env.BUCKET_NAME,
      Key: object.Key,
    };

    return s3Client.send(new GetObjectCommand(params));
  })!;

  // if(!promises) return Promise.resolve([])
  const metadatas = await Promise.all(promises);
  const taskList = metadatas.map((metadata) => {
    const obj: Task = {
      id: metadata.Metadata?.id!,
      title: metadata.Metadata?.["file-name"]!,
      label: metadata.Metadata?.["access-level"]!,
      access: metadata.Metadata?.["confidentiality"]!,
      type: metadata.Metadata?.["file-type"]!,
      addedBy: metadata.Metadata?.["added-by"]!,
      addedOn: metadata.Metadata?.["added-on"]!,
    };
    return obj;
  });
  return {
    folders:
      data.CommonPrefixes?.map(({ Prefix }) => ({
        name: Prefix?.slice(0, Prefix?.length - 1),
        path: Prefix,
        url: `/?prefix=${Prefix}`,
      })) || [],
    objects:
      data.Contents?.map(({ Key, LastModified, Size }) => ({
        name: Key?.slice(prefix.length),
        lastModified: LastModified,
        size: Size,
        path: Key,
        url: `http://${process.env.BUCKET_NAME}/${Key}`,
      })) || [],
    tasks: taskList,
  };
}
