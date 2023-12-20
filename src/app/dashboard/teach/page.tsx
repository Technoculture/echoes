import { Metadata } from "next";

import { columns } from "@/components/tablecomponents/columns";
import { DataTable } from "@/components/tablecomponents/data-table";
import { UserNav } from "@/components/tablecomponents/user-nav";
import { auth, currentUser } from "@clerk/nextjs";
import { S3Client } from "@aws-sdk/client-s3";
import { listContents } from "@/utils/apiHelper";
export const metadata: Metadata = {
  title: "Tasks",
  description: "A task and issue tracker build using Tanstack Table.",
};

type Props = {};

export default async function Page(props: Props) {
  // const tasks = await getTasks();

  const { orgSlug } = auth();
  const user2 = await currentUser();

  const s3Client = new S3Client({
    region: process.env.AWS_REGION!,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });

  const output = await listContents({
    s3Client,
    prefix: `${orgSlug}/}`,
  });

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
                orgSlug={orgSlug!}
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
