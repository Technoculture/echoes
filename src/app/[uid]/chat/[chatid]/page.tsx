import Chat from '@/components/chat';
import { ChatLog } from '@/types/types';
import { currentUser } from '@clerk/nextjs';
import { db } from '@/db';
import { redirect } from 'next/navigation';
import { chats, Chat as ChatSchema } from '@/db/schema';
import { eq } from 'drizzle-orm';

export default async function Page({ params }: { params: { uid: string, chatid: string } }) {
  console.log(params);

  const user = await currentUser();
  if (!params.uid || !params.chatid || !user || user.username !== params.uid) {
    // - userid in url is not undefined
    // - chatid in url is not undefined
    // - user is logged in
    // - user is the same as the one in the url
    console.log('redirecting to "/"');
    redirect("/");
  }

  const fetchedChat: ChatSchema[] = await db.select()
    .from(chats)
    .where(eq(chats.id, Number(params.chatid)))
    .limit(1);
  // console.log('fetchedChat', fetchedChat[0]);

  const msg = fetchedChat[0]?.messages;
  const chatlog: ChatLog = { "log": [] };
  if (fetchedChat.length === 1 && msg) {
    const chatlog: ChatLog = JSON.parse(msg);    
    console.log('chatlog', chatlog);
  }

  const pushChat = async (chat_entries: ChatLog) => {
    'use server';

    await db.update(chats)
      .set({ messages: JSON.stringify(chat_entries) })
      .where(eq(chats.id, Number(params.chatid)));
  }

  return (
    <div className='flex-col grow h-full justify-between'>
      <Chat chat={chatlog} pushNewChat={pushChat} />
    </div>
  );
}

