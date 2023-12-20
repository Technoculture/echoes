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
  fileName: string;
  fileType: string;
  // username: string;
  authors: string; // authors of the document
  confidentiality: string; // confidentiality level
  access: string; // access level
  type: string; // type of document
  // userId: string;
  // orgSlug: string;
  // orgId: string;
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

  // const { fileName, fileType, chatId, orgId, orgSlug, userId, username } = body;
  const {
    id,
    userName,
    userId,
    fileName,
    fileType,
    authors,
    confidentiality,
    access,
    type,
  } = body;

  const client = new S3Client({
    region: env.AWS_REGION,
    credentials: {
      accessKeyId: env.AWS_ACCESS_KEY_ID,
      secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
    },
  });

  // const fileKey = `${orgSlug}/${fileName}`;
  // TODO: add orgSlug and prefix for parent folder to the fileKey
  const fileKey = `testing-docs-upload/${fileName}`;
  const putCommand = new PutObjectCommand({
    Bucket: process.env.BUCKET_NAME,
    // Key: fileName,
    Key: fileKey,
    ContentType: fileType,
    Metadata: {
      id: id,
      "file-name": fileName,
      "Content-Type": fileType,
      authors: authors, // authors of the document
      confidentiality: confidentiality, // confidentiality level
      "access-level": access, // access level
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
