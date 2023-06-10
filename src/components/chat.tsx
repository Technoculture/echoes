'use client';

import ChatMessage from '@/components/chatmessage';
import { ChatLog, ChatEntry } from '@/types/types';
import InputBar from "@/components/inputBar";
import { useState } from 'react';

import { useRouter } from 'next/navigation'

interface ChatProps {
  uid: string;
  chat: ChatLog;
  pushNewChat: (chat: ChatLog) => Promise<string>;
}

export default function Chat(props: ChatProps) {
  // console.log(props.chat)
  const [messages, setMessages] = useState<ChatEntry[]>(props.chat.log);
  const router = useRouter()

  console.log('messages', messages);

  const send = async (message: string) => {
    let newMessages = [
      ...messages, 
      { "role": "user", "content": message } as ChatEntry
    ];
    setMessages(newMessages);
    const id: string = await props.pushNewChat({ "log": newMessages });

    if (id !== "") {
      console.log('pushed new chat with id', id);
      router.push(`/${props.uid}/chat/${id}`);
    }
  }

  return (
    <div className='flex-col cols-span-2'>
      {
        messages.map((entry: ChatEntry, index: number) => {
          if (entry.role !== "system") {
            return (
              <ChatMessage
                chat={entry}
                key={index}
              />);
          }
        })
      }
      <InputBar
        onSubmit={(msg) => send(msg)}
      />
    </div>
  );
}

