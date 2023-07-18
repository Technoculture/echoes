import { Button, buttonVariants } from "@/components/button";
import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { chats, Chat as ChatSchema } from "@/lib/db/schema";
import { eq, sql, desc } from "drizzle-orm";
import { PlusIcon } from "lucide-react";
import { auth } from "@clerk/nextjs";
import { ExecutedQuery } from "@planetscale/database";

import Chatcard from "@/components/chatcard";
// import Uploadzone from "@/components/uploadzone";

export const dynamic = "force-dynamic",
  revalidate = 0;

export default async function Page({ params }: { params: { uid: string } }) {
  const { uid } = params;
  const { userId, sessionClaims } = auth();
  if (!userId || !uid || userId !== uid) {
    redirect("/");
  }

  let orgConversations = [] as ChatSchema[];
  const isOrgExist = Object.keys(sessionClaims?.organizations as Object).length;
  if (isOrgExist) {
    orgConversations = await db
      .select()
      .from(chats)
      .where(eq(chats.user_id, String(sessionClaims.org_id)))
      .orderBy(desc(chats.updatedAt))
      .limit(10);
  }
  const maxChatId = await getMaxId();

  return (
    <div className={`grid gap-4 "grid-cols-1"}`}>
      {!isOrgExist ? (
        <div>
          You are not a member in any Organisations{" "}
          <Button className="mr-4 h-[32px]" variant="secondary" asChild>
            <Link href="/create-org">Create One</Link>
          </Button>
        </div>
      ) : (
        <div>
          <div>
            <div className="grid md:grid-cols-4 gap-2">
              <Link
                href={{
                  pathname: `${sessionClaims.org_slug}/chat/${maxChatId + 1}`,
                }}
                className={buttonVariants({ variant: "default" })}
              >
                <PlusIcon className="w-4 h-4 mr-4" />
                Start a new Chat
              </Link>
              {orgConversations.map((chat) => {
                return (
                  <Chatcard
                    chat={chat}
                    org_id={sessionClaims.org_id}
                    uid={uid}
                    key={chat.id}
                    org_slug={sessionClaims?.org_slug as string}
                  />
                );
              })}
            </div>
            {/* <Uploadzone
              orgId={sessionClaims.org_id as string}
              className="my-4 border"
            /> */}
          </div>
        </div>
      )}
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
