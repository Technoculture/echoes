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
  const { userId , sessionClaims} = auth();
  if (!userId || !uid || userId !== uid) {
    redirect("/");
  }

  
  let orgConversations = [] as ChatSchema[];
  const isOrgExist = sessionClaims.org_id;
  if (isOrgExist) {
    orgConversations = await db
      .select()
      .from(chats)
      .where(eq(chats.user_id, String(sessionClaims.org_id)));
  }

  const conversations: ChatSchema[] = await db
    .select()
    .from(chats)
    .where(eq(chats.user_id, params.uid))
    .orderBy(desc(chats.updatedAt))
    .limit(10);

  let maxId = {} as {latestChatId: string};
  try {
    // const queryResult : ExecutedQuery = await db.execute(sql`select Max(chats.id) as latestChatId from chats where ${chats.user_id} = ${params.uid}`)
    const queryResult: ExecutedQuery = await db.execute(
      sql`select Max(chats.id) as latestChatId from chats `
    );
    maxId = queryResult.rows[0] as {latestChatId: string};
  } catch(err){
    maxId.latestChatId = '0';
      console.log(err, "inside /[uid]")
  }

  return (
    <div className={`grid gap-8 ${isOrgExist ? "grid-cols-2" : "grid-cols-1"}`}>
      <div>
        <h2 className="mb-4">Personal Chat</h2>
        <div className="grid md:grid-cols-4 gap-2">
          <Link
            href={`${uid}/chat/${Number(maxId.latestChatId) + 1}`}
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
              {(JSON.parse(chat.messages as string) as ChatLog)?.log.length ||
                0}
              )
            </Link>
          ))}
        </div>
      </div>
      {!isOrgExist ? null : (
      <div>
        <div>
          <h2 className="mb-4">Organization Chat</h2>          
          <div className="grid md:grid-cols-3 gap-2">
            <Link
              href={{
                pathname: `${uid}/chat/${Number(maxId.latestChatId) + 1}`,
                query: {
                  orgId: String(sessionClaims.org_id),
                },
              }}
              className={buttonVariants({ variant: "default" })}
            >
              <PlusIcon className="w-4 h-4 mr-4" />
              Start a new Chat
            </Link>
            {orgConversations.map((chat) => (
              <Link
                href={{
                  pathname: `${uid}/chat/${chat.id}`,
                  query: {
                    orgId: String(sessionClaims.org_id)
                  },
                }}
                key={chat.id}
                className={buttonVariants({ variant: "secondary" })}
              >
                {chat.id}(
                {(JSON.parse(chat.messages as string) as ChatLog)?.log
                  .length || 0}
                )
              </Link>
            ))}
          </div>
        </div>
      </div>)}
    </div>
  );
}
