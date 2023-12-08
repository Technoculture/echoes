"use client";
import { useState, useEffect } from "react";
import { AIType, ChatEntry, ChatLog } from "@/lib/types";
import InputBar from "@/components/inputBar";
import { Message, useChat } from "ai/react";
import Startnewchatbutton from "@/components/startnewchatbutton";
import ChatMessageCombinator from "@/components/chatmessagecombinator";

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
  // const updateRoomData = useMutation(({ storage }, data) => {
  //   storage.set("chat", data);
  // }, []);

  // const updateRoomAsCompleted = useMutation(({ storage }, newMessage) => {
  //   const list = storage.get("chat");
  //   list.push(JSON.parse(newMessage));
  // }, []);

  // write down updateRoomData dummy without storage

  // console.log("presenceData", presenceData)
  // const state = useChannelStateListener({ channelName: "room_5" })
  // console.log("state", state)
  const updateRoomData = (data: any) => {
    console.log("updateRoomData", data);
  };
  // same for updateRoomAsCompleted
  const updateRoomAsCompleted = (message: string) => {
    console.log("updateRoomAsCompleted", message);
  };

  const [choosenAI, setChoosenAI] = useState<AIType>("universal");
  const [isChatCompleted, setIsChatCompleted] = useState<boolean>(false);
  const [calculatedMessages, setCalculatedMessages] = useState<Message[][]>([]);
  const [triggerPatentSearch, setTriggerPatentSearch] =
    useState<boolean>(false);
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
    initialMessages: props.dbChat?.log as Message[],
    // props.liveChat !== null
    //   ? (props.liveChat as Message[])
    //   : (props.dbChat?.log as Message[]),
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
    onResponse(response) {
      console.log("got the response", response);
    },
    onFinish(message) {
      console.log("got the finish", message);
    },
    sendExtraMessageFields: true,
  });

  useEffect(() => {
    if (props.liveChat !== null) {
      updateRoomData(messages);
    }
  }, [messages]);

  useEffect(() => {
    let mainArray: Message[][] = [];
    let subarray: Message[] = [];
    console.log("props.liveChat", props.liveChat?.length);
    let length = props.liveChat?.length as number;
    if (props.liveChat && props.liveChat.length > 0) {
      props.liveChat.forEach((message, index) => {
        if (message.role === "user") {
          if (index === 0) {
            subarray.push(message as Message);
          } else {
            mainArray.push(subarray);
            subarray = [];
            subarray.push(message as Message);
          }
        } else if (index === length - 1) {
          subarray.push(message as Message);
          mainArray.push(subarray);
        } else {
          subarray.push(message as Message);
        }
      });
      setCalculatedMessages(mainArray);
    } else {
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
    }
  }, [props.liveChat?.length, props.dbChat, messages]);

  return (
    <div className="flex flex-col gap-1 mx-auto">
      {/* <div className="grid grid-cols-1 gap-2"> */}
      {/* {props.liveChat
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
            })} */}

      <ChatMessageCombinator
        calculatedMessages={calculatedMessages}
        messages={messages}
        chatId={props.chatId}
        orgId={props.orgId}
        name={props.username}
        uid={props.uid}
        setMessages={setMessages}
        updateRoomData={updateRoomData}
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
