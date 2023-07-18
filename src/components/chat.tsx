"use client";
import { useState, useEffect } from "react";
import ChatMessage from "@/components/chatmessage";
import { ChatLog } from "@/lib/types";
import InputBar from "@/components/inputBar";
import { Message, useChat } from "ai/react";

interface ChatProps {
  orgId: string;
  uid: string;
  chat: ChatLog;
  chatId: string;
  username: string;
}

export default function Chat(props: ChatProps) {
  const [isFast, setIsFast] = useState<boolean>(false);
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: `/api/chatmodel/${props.chatId}`,
    initialMessages: props.chat.log as Message[],
    body: {
      orgId: props.orgId,
      isFast: isFast,
    }, // some conflicts in role
  });

  useEffect(() => {
    console.log("isFast changing", isFast);
  }, [isFast]);

  return (
    <div className="grid grig-cols-1 gap-1">
      {messages.map((entry, index) => {
        if (entry.role !== "system") {
          return (
            <ChatMessage
              uid={props.uid}
              name={props.username}
              chat={entry}
              key={entry.id || index}
            />
          );
        }
      })}
      <InputBar
        isFast={isFast}
        setIsFast={setIsFast}
        onSubmit={handleSubmit}
        value={input}
        onChange={handleInputChange}
      />
    </div>
  );
}
