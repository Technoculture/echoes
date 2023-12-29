import { saveToDB } from "@/utils/apiHelper";
import { auth } from "@clerk/nextjs";
import { Message } from "ai";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  params: { params: { chatid: string } },
) {
  const body = await request.json();
  const { orgSlug } = await auth();
  const chatId = params.params.chatid;
  const url = request.url;
  const urlArray = url.split("/");

  const _chat = body.messages as Message[];
  let orgId = body.orgId;
  const userId = body.userId;

  if (_chat.length > 0) {
    const latestReponse = _chat.pop();
    await saveToDB({
      _chat: _chat,
      chatId: Number(chatId),
      orgSlug: orgSlug as string,
      latestResponse: latestReponse!,
      userId: userId,
      orgId: orgId,
      urlArray: urlArray,
    });
  }

  return NextResponse.json({ status: "ok" });
}
