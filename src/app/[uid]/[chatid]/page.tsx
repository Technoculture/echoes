import Chat from '@/components/chat';
import { ChatEntry, ChatLog } from '@/types/types';
import { db } from '@/db';

export default async function Page({ params }: { params: { uid: string, chatid: string } }) {
  const chatEntry: ChatEntry = { "role": "user", "content": "hello" };
  const chat: ChatLog = { "log": [chatEntry] };

  console.log(params);

  const fetchChat = async () => {
    'use server';
    // const chat = await db.select('chat', params.chatid);
  }

  return (
    <div className='flex-col flex-grow h-full justify-between'>
      <Chat chat={chat} />
    </div>
  );
}

