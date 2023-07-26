import { Button } from "@/components/button";
import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { chats, Chat as ChatSchema } from "@/lib/db/schema";
// import { eq, sql, desc } from "drizzle-orm";
import { eq, desc, ne, and } from "drizzle-orm";
import { auth } from "@clerk/nextjs";
// import { ExecutedQuery } from "@planetscale/database";

import Chatcard from "@/components/chatcard";
import Startnewchatbutton from "@/components/startnewchatbutton";
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
      .where(
        and(
          eq(chats.user_id, String(sessionClaims.org_id)),
          ne(chats.messages, "NULL"),
        ),
      )
      .orderBy(desc(chats.updatedAt))
      .limit(10)
      .all();
  }
  // const maxChatId = await getMaxId();
  const maxChatId = await getMaxId(sessionClaims.org_id);

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
              <Startnewchatbutton
                org_id={sessionClaims.org_id as string}
                org_slug={sessionClaims.org_slug as string}
              />
              {orgConversations?.map((chat) => {
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

// postgres
// const getMaxId = async (): Promise<number> => {
//   let maxId = {} as { latestChatId: string };
//   try {
//     const queryResult: ExecutedQuery = await db.execute(
//       sql`select Max(chats.id) as latestChatId from chats `,
//     );
//     maxId = queryResult.rows[0] as { latestChatId: string };
//     return +maxId.latestChatId;
//   } catch (err) {
//     return 0;
//   }
// };
// sqlite
const getMaxId = async (id: string | undefined): Promise<number> => {
  try {
    const queryResult = await db
      .select()
      .from(chats)
      .where(eq(chats.user_id, String(id)))
      .orderBy(desc(chats.updatedAt))
      .all();
    console.log("queryResult length", queryResult.length);
    return queryResult.length;
  } catch (err) {
    return 0;
  }
};
