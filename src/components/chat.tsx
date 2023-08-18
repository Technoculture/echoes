"use client";
import { useState, useEffect, useRef } from "react";
import ChatMessage from "@/components/chatmessage";
import { ChatEntry, ChatLog } from "@/lib/types";
import InputBar from "@/components/inputBar";
import { Message, useChat } from "ai/react";
import { useMutation } from "../../liveblocks.config";
import React from "react";
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
  // const tempAdd = useMutation(({ storage }) => {
  //   // storage.set("chat", data);
  //   const list = storage.get("chat");
  //   const data = {
  //     "role": "assistant",
  //     "content": null,
  //      "function_call": {
  //       "name": "get_current_weather",
  //       "arguments": "{ \"location\": \"Boston, MA\"}"
  //       }
  //     }
  // }, []);

  const divRef = useRef<HTMLDivElement>(null);

  // useEffect(() => {
  //   const element = divRef.current as Element;
  //   const Forna = new fornac.FornaContainer(element,  {'initialSize':[800,600]});
  //   let options = {
  //     structure: "..((..((...[)).(((..].))).))..",
  //     sequence: "AACGCUUCAUAUAAUCCUAAUGACCUAUAA",
  //   };
  //   Forna.addRNA(options.structure, options);
  //   // element.appendChild(el)
  // }, [divRef.current])
  // console.log("typeof fornac",  fornac)

  // let firstUrl = `/api/chatmodel/${props.chatId}`
  const [isFast, setIsFast] = useState<boolean>(true);
  // const [apiUrl, setApiUrl] = useState(firstUrl)
  const {
    messages,
    input,
    setInput,
    handleInputChange,
    handleSubmit,
    append,
    setMessages,
  } = useChat({
    // api: isFast ? `/api/chatmodel/${props.chatId}` : `https://technoculture-echoes--bioinformatics-ai-web.modal.run?prompt=fold ATGCGCGC`,
    api: `/api/chatmodel/${props.chatId}`,
    // api: apiUrl,
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

  // useEffect(() => {
  //   if(apiUrl.startsWith('/api')){
  //     // setApiUrl(`https://technoculture-echoes--bioinformatics-ai-web.modal.run?prompt=fold ${messages[messages.length -1].content}`)
  //     setApiUrl(`https://technoculture-echoes--bioinformatics-ai-web.modal.run?prompt=fold ATGCGCGC`)
  //     console.log("isFast changing", apiUrl)
  //   } else {
  //     setApiUrl(`/api/chatmodel/${props.chatId}`)
  //     console.log("inside else")
  //   }
  // },[isFast])

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
      {/* <div id="#forna" ref={divRef} ></div> */}
      <InputBar
        messages={messages}
        setMessages={setMessages}
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
