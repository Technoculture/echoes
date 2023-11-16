import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema";
import { NextResponse } from "next/server";
import { generateTitle } from "@/utils/apiHelper";
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
  const fullResponse = await generateTitle(messages);
  fetch(
    `https://zeplo.to/https://${urlArray[2]}/api/generateImage/${chatId}/${orgId}?_token=${env.ZEPLO_TOKEN}`,
    {
      method: "POST",
      body: JSON.stringify({ chatTitle: fullResponse }),
      headers: {
        "z-zeplo-secret": env.ZEPLO_TOKEN,
      },
    },
  );
  await db
    .update(chats)
    .set({ title: fullResponse })
    .where(and(eq(chats.id, Number(chatId)), eq(chats.user_id, String(orgId))))
    .run();
  return new NextResponse(fullResponse);
}
