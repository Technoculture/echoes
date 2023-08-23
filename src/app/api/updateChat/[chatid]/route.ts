import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema";
import { ChatLog } from "@/lib/types";
import { Message } from "ai";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

type UpdateChatBody = {
  chatId: string;
  // messageIndex: string | number
  // updatedContent: string
  updatedMessages: Omit<Message, "id">[];
};

export async function POST(
  request: Request,
  params: { params: { chatid: string } },
) {
  const body: UpdateChatBody = await request.json();
  const chatId = params.params.chatid;
  // let chatId = body.chatId;
  let updatedMessages = body.updatedMessages;
  console.log("updatedMessages", updatedMessages);
  // let messageIndex = body.messageIndex;
  // let updatedContent = body.updatedContent;

  try {
    await db
      .update(chats)
      .set({
        messages: JSON.stringify({ log: updatedMessages } as ChatLog),
      })
      .where(eq(chats.id, Number(chatId)))
      // eq(chats.id, Number(orgId)),
      //       eq(chats.user_id, sessionClaims.org_id),
      .run();
    return NextResponse.json({ message: "updated" }, { status: 200 });
  } catch (err) {
    console.log(err);
    return NextResponse.json({ message: "try again" }, { status: 400 });
  }
}
