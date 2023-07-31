"use client";
import { useState } from "react";
import ChatMessage from "@/components/chatmessage";
import { ChatEntry, ChatLog } from "@/lib/types";
import InputBar from "@/components/inputBar";
// import { Message, useChat } from "ai/react";
import { useChat, Message } from "@/utils/ai";
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
  const addNewLiveMessage = useMutation(({ storage }, newMessage) => {
    const list = storage.get("chat");
    list.push(newMessage);
    console.log("added new message");
  }, []);
  const updateLiveMessages = useMutation(({ storage }, updatedMessage) => {
    console.log("updatedMessage", updatedMessage);
    const list = storage.get("chat");
    const latestItem = list.get(list.length - 1);
    if (latestItem?.role === "user") {
      list.push(updatedMessage);
    } else {
      list.set(list.length - 1, updatedMessage);
    }
  }, []);
  const getLiveMessages = () => {
    console.log("got live Messages");
    return props.liveChat ? (props.liveChat as Message[]) : ([] as Message[]);
  };

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
    },
    getLiveMessages,
    updateLiveMessages,
    addNewLiveMessage,
  });

  return (
    <div className="grid grig-cols-1 gap-1">
      {props.liveChat
        ? props.liveChat.map((entry, index) => {
            if (entry.role !== "system") {
              return (
                <ChatMessage
                  uid={props.uid}
                  name={props.username}
                  chat={entry as Message}
                  key={entry.id || index}
                />
              );
            }
          })
        : messages.map((entry, index) => {
            if (entry.role !== "system") {
              return (
                <ChatMessage
                  uid={props.uid}
                  name={props.username}
                  chat={entry as Message}
                  key={entry.id || index}
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
