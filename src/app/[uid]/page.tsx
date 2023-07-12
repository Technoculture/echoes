import { buttonVariants } from "@/components/button";
import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { chats, Chat as ChatSchema } from "@/lib/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { ChatLog } from "@/lib/types";
import { PlusIcon } from "lucide-react";
import { auth } from "@clerk/nextjs";
import { ExecutedQuery } from "@planetscale/database";

export const revalidate = 0;

export default async function Page({ params }: { params: { uid: string } }) {
  const { uid } = params;
  const { userId } = auth();
  if (!userId || !uid || userId !== uid) {
    redirect("/");
  }

  const conversations: ChatSchema[] = await db
    .select()
    .from(chats)
    .where(eq(chats.user_id, params.uid))
    .orderBy(desc(chats.updatedAt))
    .limit(10);

  const maxChatId = await getMaxId();

  return (
    <div className="grid grid-cols-1 gap-2">
      <div className="grid md:grid-cols-4 gap-2">
        <Link
          href={`${uid}/chat/${maxChatId + 1}`}
          className={buttonVariants({ variant: "default" })}
        >
          <PlusIcon className="w-4 h-4 mr-4" />
          Start a new Chat
        </Link>
        {conversations.map((chat) => (
          <Link
            href={`${uid}/chat/${chat.id}`}
            key={chat.id}
            className={buttonVariants({ variant: "secondary" })}
          >
            {chat.id}(
            {(JSON.parse(chat.messages as string) as ChatLog)?.log.length || 0})
          </Link>
        ))}
      </div>
    </div>
  );
}

const getMaxId = async (): Promise<number> => {
  let maxId = {} as { latestChatId: string };
  try {
    const queryResult: ExecutedQuery = await db.execute(
      sql`select Max(chats.id) as latestChatId from chats `,
    );
    maxId = queryResult.rows[0] as { latestChatId: string };
    return +maxId.latestChatId;
  } catch (err) {
    return 0;
  }
};
