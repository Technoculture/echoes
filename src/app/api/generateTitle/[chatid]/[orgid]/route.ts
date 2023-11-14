import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema";
import { NextResponse } from "next/server";
import { generateTitle } from "@/utils/apiHelper";
import axios from "axios";
import { env } from "@/app/env.mjs";
import { ChatEntry } from "@/lib/types";
export const revalidate = 0; // disable cache

export async function POST(
  request: Request,
  params: { params: { chatid: string; orgid: string } },
) {
  const chatId = params.params.chatid;
  let orgId = params.params.orgid;
  const body = await request.json();

  const messages: ChatEntry[] = body.chat;
  const url = request.url;
  const urlArray = url.split("/");
  const mainUrl = urlArray.slice(0, 3).join("/");
  const fullResponse = await generateTitle(messages);
  axios.post(
    `zeplo.to/${mainUrl}/api/generateImage/${chatId}/${orgId}?_token=${env.ZEPLO_TOKEN}`,
    { chatTitle: fullResponse },
  );
  await db
    .update(chats)
    .set({ title: fullResponse })
    .where(and(eq(chats.id, Number(chatId)), eq(chats.user_id, String(orgId))))
    .run();
  return new NextResponse(fullResponse);
}
