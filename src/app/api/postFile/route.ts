import { NextResponse } from "next/server";
import {
  PutObjectCommand,
  GetObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "@/app/env.mjs";
import { addToDatasource, hasPermission } from "@/utils/apiHelper";
import { addToDatasourceSchema } from "@/lib/types";
import { PERMISSIONS } from "@/utils/constants";
import * as z from "zod";
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

const postFileSchema = z.object({
  id: z.string(),
  userName: z.string(),
  userId: z.string(),
  orgSlug: z.string(),
  fileName: z.string(),
  fileType: z.enum(["application/pdf", "image/png", "image/jpeg"]),
  confidentiality: z.enum(["confidential", "non-confidential"]),
  access: z.enum(["internal", "external"]),
  type: z.enum(["patent", "paper", "documentation", "report"]),
});

export async function POST(request: Request) {
  // const body: PostPdfody = await request.json();
  const body = postFileSchema.parse(await request.json());

  const url = request.url;
  const urlArray = url.split("/");

  const {
    id,
    userName,
    userId,
    orgSlug,
    fileName,
    fileType,
    confidentiality,
    access,
    type,
  } = body;

  if (!hasPermission({ permission: PERMISSIONS.uploadFile })) {
    return NextResponse.json(
      { message: "you are not allowed to perform this action" },
      { status: 401 },
    );
  }
  console.log("body", body);

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

  const file_s3_url = `${env.IMAGE_PREFIX_URL}${fileKey}`;

  const zeploUrl = `https://zeplo.to/https://${urlArray[2]}/api/superagent/datasource/${orgSlug}?_token=${env.ZEPLO_TOKEN}`;

  const postBody = addToDatasourceSchema.parse({
    name: fileName,
    description: "Uploaded by " + userName,
    type: fileType,
    url: file_s3_url,
  });
  addToDatasource({ postBody: postBody, zeploUrl: zeploUrl });

  return new NextResponse(JSON.stringify({ postUrl: post, getUrl: get }));
}
