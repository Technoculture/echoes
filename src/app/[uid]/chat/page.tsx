import Chat from '@/components/chat';
import InputBar from "@/components/inputBar";
import { ChatEntry, ChatLog } from '@/types/types';
import { db } from '@/db/db';

//const fetchAChatLog = async (id: string): Promise<ChatLog> => {
//  const message = await db.select('*').from('message').where('id', id);
//}

export default function Page() {
    const chatEntry: ChatEntry = { "role": "user", "content": "hello" };
    const chat: ChatLog = { "log": [chatEntry] };

  return (
    <div className='flex-col flex-grow h-full justify-between'>
      <Chat chat={chat} />
      <InputBar />
    </div>
  );
}
