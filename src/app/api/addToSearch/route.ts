import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { nanoid } from "ai";
import { ChatEntry } from "@/lib/types";
import { NextResponse } from "next/server";
import algoliasearch from "algoliasearch";
import { env } from "@/app/env.mjs";
export async function POST(request: Request) {
  const body = await request.json();

  const chatId = body.chatId;
  const chatsData = body.chats as ChatEntry[];
  const orgSlug = body.orgSlug;
  // fetch the chat from the database
  const chat = await db
    .select()
    .from(chats)
    .where(eq(chats.id, Number(chatId)))
    .run();

  const chatData = chat.rows[0];

  const createdAt = chatData.created_at;
  const updatedAt = chatData.updated_at;
  const chatTitle = chatData.title;

  const chatsToBePushed = chatsData.map((chat) => {
    return {
      ...chat,
      objectID: nanoid(),
      orgSlug,
      chatId: chatId,
      chatTitle,
      createdAt,
      updatedAt,
    };
  });

  const client = algoliasearch(
    env.NEXT_PUBLIC_ALGOLIA_APP_ID,
    env.ALGOLIA_WRITE_API_KEY,
  );

  const index = client.initIndex(env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME);
  const data = await index.saveObjects(chatsToBePushed);

  console.log("data", data);

  console.log("chatsToBePushed", chatsToBePushed);

  return NextResponse.json({ ok: true });
}
