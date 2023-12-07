"use client";
import { useState, useEffect } from "react";
import ChatMessage from "@/components/chatmessage";
import {
  AIType,
  CHAT_COMPLETION_CONTENT,
  ChatEntry,
  ChatLog,
} from "@/lib/types";
import InputBar from "@/components/inputBar";
import { Message, useChat } from "ai/react";
import { useMutation } from "../../liveblocks.config";
import { ContextWrapper } from "@/components/contextwrapper";
import Startnewchatbutton from "@/components/startnewchatbutton";

interface ChatProps {
  orgId: string;
  uid: string;
  dbChat?: ChatLog;
  liveChat?: readonly ChatEntry[] | null;
  chatId: string;
  username: string;
  org_slug: string;
  chatTitle: string;
  imageUrl: string;
}

export default function Chat(props: ChatProps) {
  const updateRoomData = useMutation(({ storage }, data) => {
    storage.set("chat", data);
  }, []);

  const updateRoomAsCompleted = useMutation(({ storage }, newMessage) => {
    const list = storage.get("chat");
    list.push(JSON.parse(newMessage));
  }, []);

  const [choosenAI, setChoosenAI] = useState<AIType>("universal");
  const [isChatCompleted, setIsChatCompleted] = useState<boolean>(false);
  const {
    messages,
    input,
    setInput,
    handleInputChange,
    handleSubmit,
    append,
    setMessages,
    isLoading,
    data,
  } = useChat({
    api: `/api/chatmodel/${props.chatId}`,
    // initialMessages: props.chat.log as Message[],
    initialMessages:
      props.liveChat !== null
        ? (props.liveChat as Message[])
        : (props.dbChat?.log as Message[]),
    body: {
      orgId: props.orgId,
      isFast: choosenAI === "universal" ? true : false,
      name: props.username,
    }, // some conflicts in role
    onError: (error) => {
      console.log("got the error", error);
      updateRoomAsCompleted(error.message);
      setIsChatCompleted(true);
    },
    sendExtraMessageFields: true,
  });

  useEffect(() => {
    if (props.liveChat !== null) {
      updateRoomData(messages);
    }
  }, [messages]);

  return (
    <div className="flex flex-col gap-1 max-w-[700px] mx-auto">
      <div className="grid grid-cols-1 gap-2">
        {props.liveChat
          ? props.liveChat.map((entry, index) => {
              if (entry.role !== "system") {
                return (
                  <ContextWrapper
                    append={append}
                    username={props.username}
                    userId={props.uid}
                    key={entry.id || index}
                  >
                    <ChatMessage
                      isLoading={isLoading}
                      messageIndex={index}
                      chatId={props.chatId}
                      orgId={props.orgId}
                      uid={props.uid}
                      name={props.username}
                      chat={entry as Message}
                      key={entry.id || index}
                      messages={messages}
                      setMessages={setMessages}
                      updateRoom={updateRoomData}
                      chatTitle={props.chatTitle}
                      imageUrl={props.imageUrl}
                    />
                  </ContextWrapper>
                );
              }
            })
          : messages.map((entry, index) => {
              if (entry.role !== "system") {
                if (index === messages.length - 1 && !isChatCompleted) {
                  // track a state to disable all the fields
                  if (messages[index].content === CHAT_COMPLETION_CONTENT) {
                    setIsChatCompleted(true);
                  }
                }
                return (
                  <ContextWrapper
                    append={append}
                    username={props.username}
                    userId={props.uid}
                    key={entry.id || index}
                  >
                    <ChatMessage
                      isLoading={isLoading}
                      messageIndex={index}
                      chatId={props.chatId}
                      orgId={props.orgId}
                      uid={props.uid}
                      name={props.username}
                      chat={entry as Message}
                      key={entry.id || index}
                      messages={messages}
                      setMessages={setMessages}
                      updateRoom={updateRoomData}
                      chatTitle={props.chatTitle}
                      imageUrl={props.imageUrl}
                    />
                  </ContextWrapper>
                );
              }
            })}
      </div>
      {isChatCompleted && (
        <div>
          <Startnewchatbutton org_slug={props.org_slug} org_id={props.orgId} />
        </div>
      )}
      <InputBar
        chatId={props.chatId}
        orgId={props.orgId}
        messages={messages}
        setMessages={setMessages}
        username={props.username}
        userId={props.uid}
        choosenAI={choosenAI}
        setChoosenAI={setChoosenAI}
        value={input}
        onChange={handleInputChange}
        setInput={setInput}
        append={append}
        isChatCompleted={isChatCompleted}
      />
    </div>
  );
}
