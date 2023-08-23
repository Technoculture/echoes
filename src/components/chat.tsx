"use client";
import { useState, useEffect } from "react";
import ChatMessage from "@/components/chatmessage";
import { ChatEntry, ChatLog } from "@/lib/types";
import InputBar from "@/components/inputBar";
import { Message, useChat } from "ai/react";
import { useMutation } from "../../liveblocks.config";

interface ChatProps {
  orgId: string;
  uid: string;
  dbChat?: ChatLog;
  liveChat?: readonly ChatEntry[] | null;
  chatId: string;
  username: string;
}

export default function Chat(props: ChatProps) {
  const updateRoomData = useMutation(({ storage }, data) => {
    storage.set("chat", data);
  }, []);

  const [isFast, setIsFast] = useState<boolean>(true);
  const {
    messages,
    input,
    setInput,
    handleInputChange,
    handleSubmit,
    append,
    setMessages,
  } = useChat({
    api: `/api/chatmodel/${props.chatId}`,
    // initialMessages: props.chat.log as Message[],
    initialMessages:
      props.liveChat !== null
        ? (props.liveChat as Message[])
        : (props.dbChat?.log as Message[]),
    body: {
      orgId: props.orgId,
      isFast: isFast,
      name: props.username,
    }, // some conflicts in role
  });

  useEffect(() => {
    if (props.liveChat !== null) {
      updateRoomData(messages);
    }
  }, [messages]);

  return (
    <div className="grid grig-cols-1 gap-1">
      {props.liveChat
        ? props.liveChat.map((entry, index) => {
            if (entry.role !== "system") {
              return (
                <ChatMessage
                  messageIndex={index}
                  chatId={props.chatId}
                  orgId={props.orgId}
                  uid={props.uid}
                  name={props.username}
                  chat={entry as Message}
                  key={entry.id || index}
                  messages={messages}
                  setMessages={setMessages}
                />
              );
            }
          })
        : messages.map((entry, index) => {
            if (entry.role !== "system") {
              return (
                <ChatMessage
                  messageIndex={index}
                  chatId={props.chatId}
                  orgId={props.orgId}
                  uid={props.uid}
                  name={props.username}
                  chat={entry as Message}
                  key={entry.id || index}
                  messages={messages}
                  setMessages={setMessages}
                />
              );
            }
          })}
      <InputBar
        username={props.username}
        userId={props.uid}
        isFast={isFast}
        setIsFast={setIsFast}
        value={input}
        onChange={handleInputChange}
        setInput={setInput}
        append={append}
      />
    </div>
  );
}
