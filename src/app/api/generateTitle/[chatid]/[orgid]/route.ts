import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema";
import { NextResponse } from "next/server";
import { generateTitle } from "@/utils/apiHelper";
import { env } from "@/app/env.mjs";
import { ChatEntry } from "@/lib/types";
export const revalidate = 0; // disable cache
import { auth } from "@clerk/nextjs";
import { cookies } from "next/headers";
export async function POST(
  request: Request,
  params: { params: { chatid: string; orgid: string } },
) {
  const chatId = params.params.chatid;
  let orgId = params.params.orgid;
  const body = await request.json();

  const { getToken } = await auth();
  console.log("ckkoies", cookies());
  console.log("token", await getToken());
  const cookieStore = cookies();
  const cookiesArray = cookieStore.getAll().map((cookie) => {
    const cookieName = cookie.name;
    const cookieValue = cookie.value;
    return [cookieName, cookieValue] as [string, string];
  });

  const messages: ChatEntry[] = body.chat;
  const url = request.url;
  const urlArray = url.split("/");
  const fullResponse = await generateTitle(messages);
  fetch(
    `https://zeplo.to/https://${urlArray[2]}/api/generateImage/${chatId}/${orgId}?_token=${env.ZEPLO_TOKEN}`,
    {
      method: "POST",
      body: JSON.stringify({ chatTitle: fullResponse }),
      // headers: {
      //   Authorization: `Bearer ${await getToken()}`,
      // },
      headers: cookiesArray,
    },
  );
  await db
    .update(chats)
    .set({ title: fullResponse })
    .where(and(eq(chats.id, Number(chatId)), eq(chats.user_id, String(orgId))))
    .run();
  return new NextResponse(fullResponse);
}
