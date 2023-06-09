import { buttonVariants } from "@/components/button";
import Link from "next/link";
import { redirect } from "next/navigation";
import { currentUser } from '@clerk/nextjs';
import { db } from "@/db";
import { chats, Chat as ChatSchema } from "@/db/schema";
import { eq } from "drizzle-orm";

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
    //.orderBy(chats.updatedAt, 'desc')
    .limit(10);

  return (
    <div className="flex-col">
      <Link href={`${uid}/chat/new`} className={buttonVariants({ variant: "secondary" })}>
        Start a new Chat
      </Link>
      <div className="grid grid-cols-4 gap-2">
      {
        conversations.map((chat) => (
          <Link 
            href={`${uid}/chat/${chat.id}`} 
            key={chat.id} 
            className={buttonVariants({ variant: "default" })}>{chat.id}</Link>
        ))}
    </div>
    </div>
  );
}
