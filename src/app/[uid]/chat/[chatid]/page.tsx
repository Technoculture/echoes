import Chat from '@/components/chat';
import { ChatLog } from '@/lib/types';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import { Chat as ChatSchema, chats } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { Button } from "@/components/button";
import { ArrowLeft, PlusIcon } from "lucide-react";
import Link from "next/link";
import { auth } from "@clerk/nextjs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/avatar";

export const revalidate = 0;

export default async function Page({ params }: { params: { uid: string, chatid: string } }) {
  const { userId } = auth();
  if (!params.uid || !params.chatid || !userId || userId !== params.uid) {
    // - userid in url is not undefined
    // - chatid in url is not undefined
    // - user is logged in
    // - user is the same as the one in the url
    console.log('redirecting to "/"');
    redirect("/");
  }

  let chatlog: ChatLog = { "log": [] };
  if (params.chatid !== 'new') {
    // Fetch the chat if it exists and is not "new"
    let fetchedChat: ChatSchema[] = await db.select()
      .from(chats)
      .where(eq(chats.id, Number(params.chatid)))
      .limit(1);

    const msg = fetchedChat[0]?.messages;
    if (fetchedChat.length === 1 && msg) {
      chatlog = JSON.parse(msg as string) as ChatLog;
    }
  }

  const pushChat = async (chat_entries: ChatLog) => {
    'use server';

    if (params.chatid === 'new') {
      // create new chat
      const { insertId } = await db.insert(chats).values({
        "user_id": params.uid,
        "messages": JSON.stringify(chat_entries),
      });
      return insertId;
    } else {
      // update existing chat
      await db.update(chats)
        .set({ messages: JSON.stringify(chat_entries) })
        .where(eq(chats.id, Number(params.chatid)));
      return "";
    }
  }

  return (
    <div className='flex-col h-full justify-between'>
      <div className="flex space-between mb-2">
        <div className="flex items-center">
          <Button variant="outline" className="mr-2" asChild>
            <Link href={`/${params.uid}`}><ArrowLeft className="h-4 w-4" /></Link>
          </Button>

          <Avatar className="mr-2 w-9 h-9">
            <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>

          <Button variant="outline" className="mr-2">
            <PlusIcon className="h-4 w-4" />
          </Button>
        </div>

        <div className="grow" />
      </div>
      <div>

      </div>
      <Chat
        chat={chatlog}
        pushNewChat={pushChat}
        uid={params.uid}
      />
    </div>
  );
}

