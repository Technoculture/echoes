// import Chat from "@/components/chat";
import { ChatLog } from "@/lib/types";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Chat as ChatSchema, chats } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
// import { Button } from "@/components/button";
// import { ArrowLeft } from "lucide-react";
// import Link from "next/link";
import { auth, currentUser } from "@clerk/nextjs";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/avatar";
// import Chatusers from "@/components/chatusersavatars";
import Room from "./Room";
import NestedRoom from "@/components/room";
export const dynamic = "force-dynamic",
  revalidate = 0;

export default async function Page({
  params,
}: {
  params: { uid: string; chatid: string };
}) {
  const { userId, sessionClaims } = auth();

  const user = await currentUser();
  console.log("user", user?.firstName, user?.lastName);
  const fullname = ((user?.firstName as string) +
    " " +
    user?.lastName) as string;
  if (
    !params.uid ||
    !params.chatid ||
    !userId ||
    sessionClaims?.org_slug !== params.uid
  ) {
    console.log('redirecting to "/"');
    redirect("/");
  }

  let chatlog: ChatLog = { log: [] };
  let fetchedChat: ChatSchema[] = [];

  if (sessionClaims.org_id) {
    fetchedChat = await db
      .select()
      .from(chats)
      .where(
        and(
          eq(chats.id, Number(params.chatid)),
          eq(chats.user_id, sessionClaims.org_id),
        ),
      )
      .limit(1);
  }
  const msg = fetchedChat[0]?.messages;
  if (fetchedChat.length === 1 && msg) {
    chatlog = JSON.parse(msg as string) as ChatLog;
  }

  return (
    // Room Provider
    <Room roomId={params.chatid} initialData={chatlog.log} uid={userId}>
      {/* Actual Room Handling */}
      <NestedRoom
        orgId={sessionClaims.org_id ? sessionClaims.org_id : ""}
        chat={chatlog}
        chatId={params.chatid}
        uid={userId}
        username={fullname}
        chatAvatarData={fetchedChat[0]}
      ></NestedRoom>
    </Room>
  );
}
