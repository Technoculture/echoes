import { NextResponse } from "next/server";
import {
  PutObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

interface PostPdfody {
  fileName: string;
  fileType: string;
  username: string;
  userId: string;
  chatId: string;
  orgSlug: string;
  orgId: string;
}

export async function POST(request: Request) {
  const body: PostPdfody = await request.json();

  const { fileName, fileType, chatId, orgId, orgSlug, userId, username } = body;

  const client = new S3Client({ region: process.env.AWS_REGION });

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

  await createFolderIfNotExist(process.env.BUCKET_NAME, `${orgSlug}/`);

  const putCommand = new PutObjectCommand({
    Bucket: process.env.BUCKET_NAME,
    Key: `${orgSlug}/${fileName}`,
    ContentType: fileType,
    Metadata: {
      "chat-id": chatId,
      "org-id": orgId,
      "org-slug": orgSlug,
      "user-id": userId,
      "user-name": username,
    },
  });
  const post = await getSignedUrl(client, putCommand, { expiresIn: 3600 });
  console.log("post", post);

  const getCommand = new GetObjectCommand({
    Bucket: process.env.BUCKET_NAME,
    Key: `${orgSlug}/${fileName}`,
  });
  const get = await getSignedUrl(client, getCommand, { expiresIn: 3600 });
  console.log("get", get);

  return new NextResponse(JSON.stringify({ postUrl: post, getUrl: get }));
}
