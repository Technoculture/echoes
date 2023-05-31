import Chat from '@/components/chat';
import { ChatEntry, ChatLog } from '@/types/types';
import { db } from '@/db/db';

//const fetchAChatLog = async (id: string): Promise<ChatLog> => {
//  const message = await db.select('*').from('message').where('id', id);
//}

export default function Page() {
    const chatEntry: ChatEntry = { "role": "user", "content": "hello" };
    const chat: ChatLog = { "log": [chatEntry] };

  return (
    <div className='grow flex flex-col'>
    <Chat chat={chat} />
    </div>
  );
}
