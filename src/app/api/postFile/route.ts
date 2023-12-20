import { NextResponse } from "next/server";
import {
  PutObjectCommand,
  GetObjectCommand,
  S3Client,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "@/app/env.mjs";
interface PostPdfody {
  id: string;
  userName: string;
  userId: string;
  orgSlug: string;
  fileName: string;
  fileType: string;
  isConfidential: boolean;
  isInternal: boolean;
  type: string; // type of document
}

export async function POST(request: Request) {
  const body: PostPdfody = await request.json();
  async function createFolder(Bucket: string | undefined, Key: string) {
    const command = new PutObjectCommand({ Bucket, Key });
    return client.send(command);
  }

  async function existsFolder(Bucket: string | undefined, Key: string) {
    const command = new HeadObjectCommand({ Bucket, Key });

    try {
      await client.send(command);
      return true;
    } catch (error: any) {
      if (error?.name === "NotFound") {
        return false;
      } else {
        throw error;
      }
    }
  }

  async function createFolderIfNotExist(
    Bucket: string | undefined,
    Key: string,
  ) {
    if (!(await existsFolder(Bucket, Key))) {
      return createFolder(Bucket, Key);
    }
  }

  const {
    id,
    userName,
    userId,
    orgSlug,
    fileName,
    fileType,
    isConfidential,
    isInternal,
    type,
  } = body;

  const client = new S3Client({
    region: env.AWS_REGION,
    credentials: {
      accessKeyId: env.AWS_ACCESS_KEY_ID,
      secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
    },
  });

  const fileKey = `${orgSlug}/${fileName}`;
  const putCommand = new PutObjectCommand({
    Bucket: process.env.BUCKET_NAME,
    Key: fileKey,
    ContentType: fileType,
    Metadata: {
      id: id,
      "file-name": fileName,
      "Content-Type": fileType,
      confidentiality: isConfidential ? "confidential" : "non-confidential", // confidentiality level
      "access-level": isInternal ? "internal" : "external", // access level
      "file-type": type,
      "added-by": userName,
      "added-on": String(Date.now()), //
    },
  });
  const post = await getSignedUrl(client, putCommand, { expiresIn: 3600 });

  const getCommand = new GetObjectCommand({
    Bucket: process.env.BUCKET_NAME,
    Key: fileKey,
  });
  const get = await getSignedUrl(client, getCommand, { expiresIn: 3600 });

  return new NextResponse(JSON.stringify({ postUrl: post, getUrl: get }));
}
