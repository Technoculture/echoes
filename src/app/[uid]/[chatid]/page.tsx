import Chat from '@/components/chat';
import { ChatEntry, ChatLog } from '@/types/types';
import { db } from '@/db';

//const fetchAChatLog = async (id: string): Promise<ChatLog> => {
//  const message = await db.select('*').from('message').where('id', id);
//}

export default function Page({ params }: { params: { uid: string, chatid: string } }) {
    const chatEntry: ChatEntry = { "role": "user", "content": "hello" };
    const chat: ChatLog = { "log": [chatEntry] };

    console.log(params);

  return (
    <div className='flex-col flex-grow h-full justify-between'>
      <Chat chat={chat} />
    </div>
  );
}

