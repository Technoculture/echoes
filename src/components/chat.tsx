'use client';

import ChatMessage from '@/components/chatmessage';
import {ChatLog, ChatEntry} from '@/lib/types';
import InputBar from '@/components/inputBar';
import {useState} from 'react';
import {useRouter} from 'next/navigation';
import { PostBody } from '@/lib/types';
interface ChatProps {
  uid: string;
  chat: ChatLog;
  chatId: string;
}


export default function Chat(props: ChatProps) {
  const [messages, setMessages] = useState<ChatEntry[]>(props.chat.log);
  const router = useRouter();


  const send = async (message: string) => {
    // changing state optimistically
    let newMessages = [
      ...messages,
      {role: 'user', content: message} as ChatEntry,
    ];
    setMessages(newMessages);

    try {
      const chat_id = props.chatId;
      const data : PostBody = {user_id: props.uid, messages:  newMessages}
      const response = await fetch(`/api/chatmodel/${chat_id}`, {
        method: 'POST',
        body: JSON.stringify(data)
      });
      if (response.body) {
        const reader = response?.body.getReader();

        while (true) {
          const {done, value} = await reader.read();

          if (done) {
            break;
          }

          const text = new TextDecoder().decode(value);
          console.log('textChunck', text, '\n');
          setMessages((prev) => {
            if (prev.length > 0) {
                const latestMessage: ChatEntry = prev.pop() as ChatEntry;
                latestMessage.apiResponse = latestMessage?.apiResponse + text;
                return [...prev, latestMessage];
            } else {
              return prev
            }
          });
        }
      }
    } catch (err) {
      console.log('something went wrong');
    }
  };

  return (
    <div className="grid grig-cols-1 gap-1">
      {messages.map((entry: ChatEntry, index: number) => {
        if (entry.role !== 'system') {
          return (
            <ChatMessage
              name={props.uid}
              chat={entry}
              key={index}
            />
          );
        }
      })}
      <InputBar onSubmit={(msg) => send(msg)} />
    </div>
  );
}
