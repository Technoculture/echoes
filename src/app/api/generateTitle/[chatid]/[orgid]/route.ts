import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { Chat, chats } from "@/lib/db/schema";
import { generateTitle } from "@/utils/apiHelpers";
import { NextResponse } from "next/server";
export const revalidate = 0; // disable cache

export async function POST(
  request: Request,
  params: { params: { chatid: string; orgid: string } },
  query: any,
) {
  const chatId = params.params.chatid;
  let orgId = params.params.orgid;

  // getting the data from db
  const orgConversations: Chat[] = await db
    .select()
    .from(chats)
    .where(and(eq(chats.id, Number(chatId)), eq(chats.user_id, String(orgId))))
    .limit(1)
    .all();

  const messages = JSON.parse(
    orgConversations[0]?.messages as string,
  ).log.splice(0, 2);

  const fullResponse = await generateTitle(messages);
  await db
    .update(chats)
    .set({ title: fullResponse })
    .where(and(eq(chats.id, Number(chatId)), eq(chats.user_id, String(orgId))))
    .run();
  return new NextResponse(fullResponse);
}
