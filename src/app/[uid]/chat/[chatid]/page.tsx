import Chat from '@/components/chat';
import { ChatLog } from '@/lib/types';
import { currentUser } from '@clerk/nextjs';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import { Chat as ChatSchema, chats } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { Button } from "@/components/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function Page({ params }: { params: { uid: string, chatid: string } }) {
  const user = await currentUser();
  if (!params.uid || !params.chatid || !user || user.username !== params.uid) {
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
      //console.debug('New chat created: ', insertId);

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
        <Button variant="outline" asChild>
          <Link href={`/${params.uid}`}><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
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

