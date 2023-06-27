'use client';

import ChatMessage from '@/components/chatmessage';
import { ChatLog, ChatEntry } from '@/lib/types';
import InputBar from "@/components/inputBar";
import { useState } from 'react';
import { useRouter } from 'next/navigation'

interface ChatProps {
  uid: string;
  chat: ChatLog;
  chatId: string;
  pushNewChat: (chat: ChatLog) => Promise<string>;
}

export default function Chat(props: ChatProps) {
  // console.log(props.chat)
  const [messages, setMessages] = useState<ChatEntry[]>(props.chat.log);
  const router = useRouter()

  //console.log('messages', messages);

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
    try{
      const data = await fetch(`/api/chatmodel/${props.chatId}`, {
        method: 'POST',
        // credentials: 'include',
      })
      console.log("data",data)
    } catch(err) {
      console.log("err", err)
    }
  }

  return (
    <div className='grid grig-cols-1 gap-1'>
      {
        messages.map((entry: ChatEntry, index: number) => {
          if (entry.role !== "system") {
            return (
              <ChatMessage
                name={props.uid}
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

