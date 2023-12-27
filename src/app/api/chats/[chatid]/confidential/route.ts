import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  params: { params: { chatid: string } },
) {
  const chatId = params.params.chatid;

  // retreive data for chat id
  const fetchedChat = await db
    .select({ field1: chats.confidential })
    .from(chats)
    .where(eq(chats.id, Number(chatId)))
    .limit(1)
    .all();

  const confidential = fetchedChat[0].field1;

  return NextResponse.json({ confidential });
}

export async function PATCH(
  request: Request,
  params: { params: { chatid: string } },
) {
  const body = await request.json();

  const chatId = params.params.chatid;

  try {
    await db
      .update(chats)
      .set({
        confidential: body.confidential,
      })
      .where(eq(chats.id, Number(chatId)))
      .run();
    return NextResponse.json({ message: "Confidentiality Updated." });
  } catch (error) {
    console.error("error updating confidentiality", error);
    return NextResponse.json(
      { message: "Confidentiality could not be updated. Please try again!" },
      { status: 400 },
    );
  }
}
