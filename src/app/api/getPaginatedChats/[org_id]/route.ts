import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema";
import { desc, eq, ne, and } from "drizzle-orm";
import { NextResponse } from "next/server";
import * as z from "zod";

const chatquery = z.enum(["me", "org"]);

export async function GET(
  request: Request,
  params: { params: { org_id: string } },
) {
  // handle if org_id is undefined or null
  const { searchParams } = new URL(request.url);
  let page = Number(searchParams.get("page"));
  let userId = searchParams.get("userId");
  let chatsQuery = chatquery.parse(searchParams.get("chats"));
  const org_id = params.params.org_id;

  if (page === null || isNaN(page)) {
    console.log("page if case", page);
    page = 1;
  }
  console.log("page", page);
  console.log("orgId", org_id);
  console.log("userId", userId);
  console.log("chats", chatsQuery);
  // need to improve the logic
  const offset = 25;
  const skip = offset * page;
  let orgConversations: any;
  if (chatsQuery === "me") {
    orgConversations = await db
      .select()
      .from(chats)
      .where(
        and(
          eq(chats.user_id, String(org_id)),
          ne(chats.messages, "NULL"),
          eq(chats.creator, String(userId)),
        ),
      )
      .orderBy(desc(chats.updatedAt))
      .offset(skip)
      .limit(25)
      .all();
  } else {
    orgConversations = await db
      .select()
      .from(chats)
      .where(
        and(
          eq(chats.user_id, String(org_id)),
          ne(chats.messages, "NULL"),
          eq(chats.confidential, 0)
        )
      )
      .orderBy(desc(chats.updatedAt))
      .offset(skip)
      .limit(25)
      .all();
  }

  // let orgConversations = await db
  //   .select()
  //   .from(chats)
  //   .where(and(eq(chats.user_id, String(org_id)), ne(chats.messages, "NULL"), eq(chats.creator, String(userId))))
  //   .orderBy(desc(chats.updatedAt))
  //   .offset(skip)
  //   .limit(25)
  //   .all();
  return NextResponse.json({ conversations: orgConversations });
}
