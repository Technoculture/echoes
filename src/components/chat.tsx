'use client';

import ChatMessage from '@/components/chatmessage';
import { ChatLog, ChatEntry } from '@/types/types';
import InputBar from "@/components/inputBar";
import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/card";

interface ChatProps {
  chat: ChatLog;
  pushNewChat: (chat: ChatLog) => Promise<void>;
}

export default function Chat(props: ChatProps) {
  const { chat } = props;
  const [messages, setMessages] = useState<ChatEntry[]>(chat.log);

  const send = (message: string) => {
    let newMessage: ChatEntry = { "role": "user", "content": message };
    props.pushNewChat({ "log": messages });
    setMessages([...messages, newMessage]);
  }

  return (
    <div className='flex-col grow'>
      <Card className="max-w-sm rounded-none">
        <CardHeader>
          <CardTitle>Objective</CardTitle>
          <CardDescription>Card Description</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Card Content</p>
          <CardDescription>Card Description</CardDescription>
        </CardContent>
        <CardFooter>
          <p>Card Footer</p>
        </CardFooter>
      </Card>
      {
        messages.map((entry: ChatEntry, index: number) => {
          if (entry.role !== "system") {
            return (<ChatMessage
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
