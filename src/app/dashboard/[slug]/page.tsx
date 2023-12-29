import { Button } from "@/components/button";
import Link from "next/link";
import { db } from "@/lib/db";
import { chats, Chat as ChatSchema } from "@/lib/db/schema";
import { eq, desc, ne, and } from "drizzle-orm";
import { auth } from "@clerk/nextjs";
import ChatCardWrapper from "@/components/chatcardwrapper";
// import Uploadzone from "@/components/uploadzone";

export const dynamic = "force-dynamic",
  revalidate = 0;

export default async function Page({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { [key: string]: string };
}) {
  const { slug } = params;
  const { userId, sessionClaims } = auth();

  let orgConversations = [] as ChatSchema[];
  // fetch initial posts to start with
  const isOrgExist = Object.keys(sessionClaims?.organizations as Object).length;

  if (isOrgExist) {
    if (searchParams.hasOwnProperty("chats") && searchParams.chats === "me") {
      orgConversations = await getConversations({
        orgId: String(sessionClaims?.org_id),
        userId: String(userId),
      });
    } else {
      orgConversations = await getConversations({
        orgId: String(sessionClaims?.org_id),
      });
    }
  }

  return (
    <div className="mt-[120px] grid gap-4 grid-cols-1 relative">
      {!isOrgExist ? (
        <div>
          You are not a member in any Organisations.{" "}
          <Button className="mr-2 h-[32px]" variant="secondary" asChild>
            <Link href="https://www.echoes.team/#requestaccess">
              Request Access
            </Link>
          </Button>
        </div>
      ) : (
        <div className="relative">
          <ChatCardWrapper
            initialData={orgConversations}
            org_id={sessionClaims?.org_id}
            uid={userId as string}
            org_slug={sessionClaims?.org_slug as string}
          />
        </div>
      )}
    </div>
  );
}

const getConversations = async ({
  orgId,
  userId,
  offset = 0,
}: {
  orgId: string;
  userId?: string;
  offset?: number;
}): Promise<ChatSchema[]> => {
  if (!userId) {
    let orgConversations = await db
      .select()
      .from(chats)
      .where(
        and(
          eq(chats.user_id, String(orgId)),
          ne(chats.messages, "NULL"),
          eq(chats.confidential, 0),
        ),
      )
      .orderBy(desc(chats.updatedAt))
      .offset(offset)
      .limit(10)
      .all();
    return orgConversations;
  } else {
    let orgConversations = await db
      .select()
      .from(chats)
      .where(
        and(
          eq(chats.user_id, String(orgId)),
          ne(chats.messages, "NULL"),
          eq(chats.creator, userId),
        ),
      )
      .orderBy(desc(chats.updatedAt))
      .offset(offset)
      .limit(10)
      .all();
    return orgConversations;
  }
};
