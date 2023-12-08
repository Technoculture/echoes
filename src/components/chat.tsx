"use client";
import { useState, useEffect } from "react";
import { AIType } from "@/lib/types";
import InputBar from "@/components/inputBar";
import { Message, useChat } from "ai/react";
import Startnewchatbutton from "@/components/startnewchatbutton";
import ChatMessageCombinator from "@/components/chatmessagecombinator";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

interface ChatProps {
  orgId: string;
  uid: string;
  dbChat: Message[];
  chatId: string;
  username: string;
  org_slug: string;
  chatTitle: string;
  imageUrl: string;
}

export default function Chat(props: ChatProps) {
  const [choosenAI, setChoosenAI] = useState<AIType>("universal");
  const [isChatCompleted, setIsChatCompleted] = useState<boolean>(false);
  const [calculatedMessages, setCalculatedMessages] = useState<Message[][]>([]);

  const chatFetcher = async () => {
    const res = await axios.get(`/api/chats/${props.chatId}`);
    const chats = res.data.chats;
    return chats as Message[];
  };
  const {
    data: chatsData,
    isLoading: isChatsLoading,
    isError,
  } = useQuery({
    queryKey: ["chats", props.chatId],
    queryFn: chatFetcher,
    initialData: props.dbChat,
  });

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
    initialMessages: chatsData,
    body: {
      orgId: props.orgId,
      isFast: choosenAI === "universal" ? true : false,
      name: props.username,
    }, // some conflicts in role
    onError: (error) => {
      console.log("got the error", error);
      setIsChatCompleted(true);
    },
    onResponse(response) {
      console.log("got the response", response);
    },
    onFinish(message) {
      console.log("got the finish", message);
    },
    sendExtraMessageFields: true,
  });

  useEffect(() => {
    let mainArray: Message[][] = [];
    let subarray: Message[] = [];

    // console.log("messages effect triggered", messages);
    if (messages && messages.length) {
      messages.forEach((message, index) => {
        if (message.role === "user") {
          if (index === 0) {
            subarray.push(message as Message);
          } else {
            mainArray.push(subarray);
            subarray = [];
            subarray.push(message as Message);
          }
        } else if (index === messages.length - 1) {
          subarray.push(message as Message);
          mainArray.push(subarray);
        } else {
          subarray.push(message as Message);
        }
      });
      setCalculatedMessages(mainArray);
    }
  }, [messages]);

  return (
    <div className="flex flex-col gap-1 mx-auto">
      <ChatMessageCombinator
        calculatedMessages={calculatedMessages}
        messages={messages}
        chatId={props.chatId}
        orgId={props.orgId}
        name={props.username}
        uid={props.uid}
        setMessages={setMessages}
        chatTitle={props.chatTitle}
        imageUrl={props.imageUrl}
        isChatCompleted={isChatCompleted}
        setIsChatCompleted={setIsChatCompleted}
        append={append}
        isLoading={isLoading}
      />
      {/* </div> */}
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
        isLoading={isLoading}
      />
    </div>
  );
}
