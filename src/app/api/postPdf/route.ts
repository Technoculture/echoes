import { NextResponse } from "next/server";
import {
  PutObjectCommand,
  GetObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

interface PostPdfody {
  fileName: string;
  fileType: string;
}

export async function POST(request: Request) {
  const body: PostPdfody = await request.json();

  const fileName = body.fileName;
  const fileType = body.fileType;

  const client = new S3Client({ region: process.env.AWS_REGION });

  const putCommand = new PutObjectCommand({
    Bucket: process.env.BUCKET_NAME,
    Key: fileName,
    ContentType: fileType,
  });
  const post = await getSignedUrl(client, putCommand, { expiresIn: 3600 });

  const getCommand = new GetObjectCommand({
    Bucket: process.env.BUCKET_NAME,
    Key: fileName,
  });
  const get = await getSignedUrl(client, getCommand, { expiresIn: 3600 });

  return new NextResponse(JSON.stringify({ postUrl: post, getUrl: get }));
}
