"use client";
import { useState, useEffect } from "react";
import ChatMessage from "@/components/chatmessage";
import { ChatEntry, ChatLog } from "@/lib/types";
import InputBar from "@/components/inputBar";
import { Message, useChat } from "ai/react";
import { useMutation } from "../../liveblocks.config";
import { Button } from "@/components/button";
import { ArrowCircleDown, ArrowCircleUp } from "@phosphor-icons/react";

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

  const [mouseDownTime, setMouseDownTime] = useState<number | null>(null);
  const [showScrollButton, setShowScrollButton] = useState<"top" | "bottom" | "both">("top");
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

  const scrollToTop = () => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  };
  const scrollToBottom = () => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100 && window.scrollY < (document.body.scrollHeight - 800) ) { // have to think about this
        setShowScrollButton(() => "both");
      } else if(window.scrollY < 100) {
        setShowScrollButton(() => "bottom");
      } else {
        setShowScrollButton(() => "top")
      }
    };
    window?.addEventListener("scroll", handleScroll);
    return () => {
      window?.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const onmousedown = () => {
    setMouseDownTime(Date.now());
  };

  const onmouseup = (goto: string) => {
    const mouseUpTime = Date.now();
    if (mouseDownTime) {
      const timeHeld = mouseUpTime - mouseDownTime;
      setMouseDownTime(null); // Reset the mouseDownTime
      if (timeHeld > 1000) {
        goto === "top" ? scrollToTop() : scrollToBottom();
      } else {
        let currEl = currentVisibleQuestionIndex === -1 ? 0 : currentVisibleQuestionIndex;
        let idToGo = goto === "top" ? `${currEl - 2}` : `${currEl + 2}`
        let el = document.getElementById(idToGo);
        console.log("inelse", el)
        el?.scrollIntoView()
        setCurrentVisibleQuestionIndex(prev => Number(idToGo)) // need to change this
      }
      console.log(`The button was held for ${timeHeld} milliseconds.`);
    }
  };

  const [currentVisibleQuestionIndex, setCurrentVisibleQuestionIndex] = useState(-1);
  // let ids = messages?.filter(message => message.role === "user" ).map(message => message.id);
  let ids = messages?.map((message, index) => message.role === "user" ? message.id ? message.id : index : -1 ).filter(num => num !== -1);

  return (
    <div className="grid grig-cols-1 gap-1">
      {props.liveChat
        ? props.liveChat.map((entry, index) => {
            if (entry.role !== "system") {
              return (
                <ChatMessage
                  id={entry.id || index}
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
                  id={entry.id || index}
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
      <Button
        onMouseDown={() => onmousedown()}
        onMouseUp={() => onmouseup("top")}
        className={`${
          ["top","both"].includes(showScrollButton) ? "fixed" : "hidden"
        } w-12 p-0  rounded-full right-4 bottom-16  `}
        variant={"ghost"}
      >
        <ArrowCircleUp size={32} />
      </Button>
      <Button
        onMouseDown={() => onmousedown()}
        onMouseUp={() => onmouseup("bottom")}
        className={`${
          ["bottom", "both"].includes(showScrollButton) ? "fixed" : "hidden"
        } w-12 p-0  rounded-full right-4 bottom-8  `}
        variant={"ghost"}
      >
        <ArrowCircleDown size={32} />
      </Button>
    </div>
  );
}
