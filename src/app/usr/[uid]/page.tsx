import { Button } from "@/components/button";
import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { chats, Chat as ChatSchema } from "@/lib/db/schema";
import { eq, desc, ne, and } from "drizzle-orm";
import { auth } from "@clerk/nextjs";
import ChatCardWrapper from "@/components/chatcardwrapper";
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
  // fetch initial posts to start with
  const isOrgExist = Object.keys(sessionClaims?.organizations as Object).length;

  if (isOrgExist) {
    orgConversations = await getConversations({
      orgId: String(sessionClaims?.org_id),
    });
  }

  return (
    <div className="grid gap-4 grid-cols-1 relative">
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
          {/* <div className="sticky z-20 bg-black/40 backdrop-blur-md py-1.5 top-[72px] flex justify-between">
            <Startnewchatbutton
              org_id={sessionClaims?.org_id as string}
              org_slug={sessionClaims?.org_slug as string}
            />
            <div className="h-[32px]">
              <OrganizationSwitcher hidePersonal={true} />
            </div>
          </div> */}
          <ChatCardWrapper
            initialData={orgConversations}
            org_id={sessionClaims?.org_id}
            uid={uid}
            org_slug={sessionClaims?.org_slug as string}
          />
        </div>
      )}
    </div>
  );
}

const getConversations = async ({
  orgId,
  offset = 0,
}: {
  orgId: string;
  offset?: number;
}): Promise<ChatSchema[]> => {
  let orgConversations = await db
    .select()
    .from(chats)
    .where(and(eq(chats.user_id, String(orgId)), ne(chats.messages, "NULL")))
    .orderBy(desc(chats.updatedAt))
    .offset(offset)
    .limit(25)
    .all();
  return orgConversations;
};
