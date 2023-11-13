import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema";
import { NextResponse } from "next/server";
import { generateChatImage } from "@/utils/apiHelper";
export const revalidate = 0; // disable cache
export const maxDuration = 60; 

export async function POST(
  request: Request,
  params: { params: { chatid: string; orgid: string } },
) {
  const chatId = params.params.chatid;
  let orgId = params.params.orgid;
  const body = await request.json();
  console.log("prompt message", body.chatTitle);
  const image_url = await generateChatImage(body.chatTitle as string, chatId);

  await db
    .update(chats)
    .set({ image_url: image_url })
    .where(and(eq(chats.id, Number(chatId)), eq(chats.user_id, String(orgId))))
    .run();
  return new NextResponse(JSON.stringify({ url: image_url }));
}
