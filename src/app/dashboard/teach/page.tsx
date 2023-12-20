import { Metadata } from "next";

import { columns } from "@/components/tablecomponents/columns";
import { DataTable } from "@/components/tablecomponents/data-table";
import { UserNav } from "@/components/tablecomponents/user-nav";
import { Task } from "@/assets/data/schema";
import { currentUser } from "@clerk/nextjs";
import {
  S3Client,
  ListObjectsV2Command,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { env } from "@/app/env.mjs";

export const metadata: Metadata = {
  title: "Tasks",
  description: "A task and issue tracker build using Tanstack Table.",
};

type Props = {};

export default async function Page(props: Props) {
  // const tasks = await getTasks();

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

  const output = await listContents({
    s3Client,
    prefix: "testing-docs-upload/",
  });
  console.log("output", output);

  // console.log("output", output);

  return (
    <div className="mt-[80px]">
      <>
        <div className="h-full flex-1 flex-col space-y-8 p-8 md:flex">
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
                username={user2?.firstName + " " + user2?.lastName}
                userId={user2?.id!}
              />
            </div>
          </div>
          <DataTable data={output.tasks} columns={columns} />
        </div>
      </>
    </div>
  );
}

// Simulate a database read for tasks.
// async function getTasks() {
//   const data = await fs.readFile(
//     path.join(process.cwd(), "src/assets/data/tasks2.json")
//   );

//   const tasks = JSON.parse(data.toString());

//   return z.array(taskSchema).parse(tasks);
// }

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

  if (!promises) return { folders: [], objects: [], tasks: [] };
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

  // console.debug(`Received data: ${JSON.stringify(data, null, 2)}`);
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
