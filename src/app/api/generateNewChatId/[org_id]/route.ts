import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema";
import { NextResponse } from "next/server";
export async function POST(
  request: Request,
  params: { params: { org_id: string } },
) {
  // const body = await request.json();
  // const org_id = body.org_id;
  console.log("getting it in the route", params.params.org_id);
  const body = await request.json();
  const chatType = body.type;
  const title = body.title;

  const id = params.params.org_id;

  if (!id) {
    return;
  }
  // console.log("got org_id", org_id)
  const data = await db
    .insert(chats)
    .values({
      user_id: id,
      type: chatType,
      title: title,
    })
    .run();
  console.log("generated New Chat id", data.toJSON());

  return NextResponse.json({
    newChatId: Number(data.toJSON().lastInsertRowid),
  });
}
