'use client';

import ChatMessage from '@/components/chatmessage';
import { ChatLog, ChatEntry } from '@/types/types';
import InputBar from "@/components/inputBar";
import { useState } from 'react';

interface ChatProps {
  chat: ChatLog;
  pushNewChat: (chat: ChatLog) => Promise<void>;
}

export default function Chat(props: ChatProps) {
  // console.log(props.chat)
  const [messages, setMessages] = useState<ChatEntry[]>(props.chat.log);
  console.log('messages', messages);

  const send = (message: string) => {
    let newMessages = [
      ...messages, 
      { "role": "user", "content": message } as ChatEntry
    ];
    setMessages(newMessages);
    props.pushNewChat({ "log": newMessages });
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

