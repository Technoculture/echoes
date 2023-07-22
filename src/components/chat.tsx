"use client";
import { useState, useEffect } from "react";
import ChatMessage from "@/components/chatmessage";
import { ChatEntry } from "@/lib/types";
import InputBar from "@/components/inputBar";
import { Message, useChat } from "ai/react";
import { useMutation } from "../../liveblocks.config";

interface ChatProps {
  orgId: string;
  uid: string;
  // chat: ChatLog;
  chat: readonly ChatEntry[];
  chatId: string;
  username: string;
}

export default function Chat(props: ChatProps) {
  const pushToLiveStorage = useMutation(
    (
      { storage },
      data: { role: string; content: string; name?: string; id?: string },
    ) => {
      const chats = storage.get("chat");
      chats.push(data as ChatEntry);
    },
    [],
  );
  const pushToLiveStorage2 = useMutation(({ storage }, data) => {
    const chats = storage.get("chat");
    storage.set("chat", data);
  }, []);

  const [isFast, setIsFast] = useState<boolean>(true);
  const { messages, input, handleInputChange, handleSubmit, setMessages } =
    useChat({
      api: `/api/chatmodel/${props.chatId}`,
      // initialMessages: props.chat.log as Message[],
      initialMessages: props.chat as Message[],
      onFinish: (message) => {
        // console.log("onFinish", message)
        // pushToLiveStorage({role: message.role, content: message.content, id: message.id})
      },
      body: {
        orgId: props.orgId,
        isFast: isFast,
      }, // some conflicts in role
    });

  // useEffect(() => {
  //   console.log("isFast changing", props.chat);
  //   setMessages(props.chat as Message[])
  // }, [props.chat]);

  useEffect(() => {
    pushToLiveStorage2(messages);
  }, [messages]);

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
        username={props.username}
        userId={props.uid}
        pushToLiveStorage={pushToLiveStorage}
        isFast={isFast}
        setIsFast={setIsFast}
        onSubmit={handleSubmit}
        value={input}
        onChange={handleInputChange}
      />
    </div>
  );
}
