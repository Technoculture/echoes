import { buttonVariants } from "@/components/button";
import Link from "next/link";
import { redirect } from "next/navigation";
import { currentUser } from '@clerk/nextjs';
import { db } from "@/lib/db";
import { chats, Chat as ChatSchema } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { ChatLog } from "@/lib/types";
import { PlusIcon } from "lucide-react";

export default async function Page({ params }: { params: { uid: string } }) {
  const { uid } = params;
  const user = await currentUser();
  // console.log(user?.username, uid);
  if (!user || !uid || user?.username !== uid) {
    redirect("/");
  }

  const conversations: ChatSchema[] = await db.select()
    .from(chats)
    .where(eq(chats.user_id, params.uid))
    .limit(10);

  return (
    <div className="grid grid-cols-1 gap-2">
      <div className="grid md:grid-cols-4 gap-2">
        <Link href={`${uid}/chat/new`} className={buttonVariants({ variant: "default" })}>
          <PlusIcon className="w-4 h-4 mr-4" />
          Start a new Chat
        </Link>
        {
          conversations.map((chat) => (
            <Link
              href={`${uid}/chat/${chat.id}`}
              key={chat.id}
              className={buttonVariants({ variant: "secondary" })}>{chat.id}(
              {
                (JSON.parse(chat.messages as string) as ChatLog)?.log.length || 0
              })
            </Link>
          ))}
      </div>
    </div>
  );
}
