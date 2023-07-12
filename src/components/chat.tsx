"use client";

import ChatMessage from "@/components/chatmessage";
import { ChatLog } from "@/lib/types";
import InputBar from "@/components/inputBar";
import { Message, useChat } from "ai/react";

interface ChatProps {
  orgId: string;
  uid: string;
  chat: ChatLog;
  chatId: string;
}

export default function Chat(props: ChatProps) {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: `/api/chatmodel/${props.chatId}`,
    initialMessages: props.chat.log as Message[],
    body: {
      orgId: props.orgId,
    }, // some conflicts in role
  });

  return (
    <div className="grid grig-cols-1 gap-1">
      {messages.map((entry, index) => {
        if (entry.role !== "system") {
          return (
            <ChatMessage
              name={props.uid}
              chat={entry}
              key={entry.id || index}
            />
          );
        }
      })}
      <InputBar
        onSubmit={handleSubmit}
        value={input}
        onChange={handleInputChange}
      />
    </div>
  );
}
