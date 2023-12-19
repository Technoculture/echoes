import React from "react";
import { promises as fs } from "fs";
import path from "path";
import { Metadata } from "next";
import Image from "next/image";
import { z } from "zod";

import { columns } from "@/components/tablecomponents/columns";
import { DataTable } from "@/components/tablecomponents/data-table";
import { UserNav } from "@/components/tablecomponents/user-nav";
import { taskSchema } from "@/assets/data/schema";
import { currentUser } from "@clerk/nextjs";
import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";
export const metadata: Metadata = {
  title: "Tasks",
  description: "A task and issue tracker build using Tanstack Table.",
};

type Props = {};

export async function TeachEchoes(props: Props) {
  const tasks = await getTasks();

  // const { user, sessionClaims } = auth()
  const user2 = await currentUser();

  // console.log("user", user2)

  const s3Client = new S3Client({
    region: process.env.AWS_REGION!,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });

  // const output = await listContents({ s3Client, prefix: "cardimages/" });

  // console.log("output", output);

  return (
    <div className="mt-[80px]">
      <>
        <div className="md:hidden">
          <Image
            src="/examples/tasks-light.png"
            width={1280}
            height={998}
            alt="Playground"
            className="block dark:hidden"
          />
          <Image
            src="/examples/tasks-dark.png"
            width={1280}
            height={998}
            alt="Playground"
            className="hidden dark:block"
          />
        </div>
        <div className="hidden h-full flex-1 flex-col space-y-8 p-8 md:flex">
          <div className="flex items-center justify-between space-y-2">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">
                Teach Echoes
              </h2>
              <p className="text-muted-foreground">
                Files added here will be used by Echoes when answering questions
                within this organization.
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <UserNav
                imageUrl={user2?.imageUrl || ""}
                firstname={user2?.firstName || "C"}
                lastname={user2?.lastName || "N"}
              />
            </div>
          </div>
          <DataTable data={tasks} columns={columns} />
        </div>
      </>
    </div>
  );
}

export default TeachEchoes;

// Simulate a database read for tasks.
async function getTasks() {
  const data = await fs.readFile(
    path.join(process.cwd(), "src/assets/data/tasks.json"),
  );

  const tasks = JSON.parse(data.toString());

  return z.array(taskSchema).parse(tasks);
}

const listContents = async ({
  s3Client,
  prefix,
}: {
  s3Client: S3Client;
  prefix: string;
}) => {
  console.debug("Retrieving data from AWS SDK");
  const data = await s3Client.send(
    new ListObjectsV2Command({
      Bucket: process.env.BUCKET_NAME,
      Prefix: prefix,
      Delimiter: "/",
      MaxKeys: 100,
    }),
  );
  console.debug(`Received data: ${JSON.stringify(data, null, 2)}`);
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
  };
};
