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

  const updateRoomAsCompleted = useMutation(({ storage }, newMessage) => {
    const list = storage.get("chat");
    list.push(JSON.parse(newMessage));
  }, []);

  const [isFast, setIsFast] = useState<boolean>(true);
  const [collectionName, setCollectionName] = useState<string>("");
  const [isChatCompleted, setIsChatCompleted] = useState<boolean>(false);
  const {
    messages,
    input,
    setInput,
    handleInputChange,
    handleSubmit,
    append,
    setMessages,
  } = useChat({
    // when want to chat with pdf-data have to include collection name with this call
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
    onError: (error) => {
      console.log("got the error", error);
      updateRoomAsCompleted(error.message);
      setIsChatCompleted(true);
    },
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
                  uid={props.uid}
                  name={props.username}
                  chat={entry as Message}
                  key={entry.id || index}
                />
              );
            }
          })
        : messages.map((entry, index) => {
            // while rendering messages look at the last message to identify if the chat is completed or not
            if (entry.role !== "system") {
              if (index === messages.length - 1 && !isChatCompleted) {
                // track a state to disable all the fields
                if (messages[index].content === "THIS CHAT IS COMPLETED") {
                  setIsChatCompleted(true);
                  console.log("got in the complete if");
                }
              }
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
        isChatCompleted={isChatCompleted}
        setCollectionName={setCollectionName}
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
