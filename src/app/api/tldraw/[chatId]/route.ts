import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema";
import { Message, nanoid } from "ai";
import { eq } from "drizzle-orm";

export async function POST(
  req: Request,
  params: { params: { chatId: string } },
) {
  const { chatId } = params.params;
  const body = await req.json();
  const content = body.content;
  const name = body.name;
  console.log("name", name);

  const _chat = [
    {
      content,
      createdAt: new Date(),
      id: nanoid(),
      role: "user",
      name,
    } as Message,
  ];

  console.log("chatId", _chat);

  await db
    .update(chats)
    .set({
      messages: JSON.stringify({ log: _chat }),
      updatedAt: new Date(),
    })
    .where(eq(chats.id, Number(chatId)))
    .run();

  return new Response(JSON.stringify({ success: true }));
}
