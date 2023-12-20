import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { env } from "@/app/env.mjs";

export async function DELETE(
  request: Request,
  params: { params: { fileKey: string } },
) {
  const fileKey = params.params.fileKey;

  console.log("got the file key", fileKey);

  const { orgSlug, orgId, userId } = await auth();

  const s3Client = new S3Client({
    region: env.AWS_REGION,
    credentials: {
      accessKeyId: env.AWS_ACCESS_KEY_ID,
      secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
    },
  });

  const key = `${orgSlug}/${fileKey}`;
  const commandParams = {
    Bucket: env.BUCKET_NAME,
    Key: key,
  };

  try {
    const command = await s3Client.send(new DeleteObjectCommand(commandParams));
    const data = command.$metadata.httpStatusCode;
    console.log("deleted the file", data, command);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.log("error deleting the file", error);
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
