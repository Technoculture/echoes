import { env } from "@/app/env.mjs";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

export async function PATCH(request: Request) {
  // identify the key for the file given filename and orgSlug
  // update the metadata for the file in S3
  // return the updated metadata

  const { fileName, orgSlug, metadata: updatedMetaData } = await request.json();

  const fileKey = `${orgSlug}/${fileName}`;

  const client = new S3Client({
    region: env.AWS_REGION,
    credentials: {
      accessKeyId: env.AWS_ACCESS_KEY_ID,
      secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
    },
  });

  const command = new PutObjectCommand({
    Bucket: env.BUCKET_NAME,
    Key: fileKey,
    Metadata: updatedMetaData,
  });

  const response = await client.send(command);

  return new Response(JSON.stringify(response), {
    headers: { "content-type": "application/json" },
  });
}
