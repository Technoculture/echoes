import { Button } from "@/components/button";
import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { chats, Chat as ChatSchema } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs";

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
      .where(eq(chats.user_id, String(sessionClaims.org_id)));
    // .orderBy(desc(chats.updatedAt))
    // .limit(10);
  }

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
