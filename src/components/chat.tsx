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
  const [showScrollButton, setShowScrollButton] = useState<boolean>(false);
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
      if (window.scrollY > 100 && !showScrollButton) {
        setShowScrollButton(() => true);
      } else {
        setShowScrollButton(() => false);
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
      }
      console.log(`The button was held for ${timeHeld} milliseconds.`);
    }
  };

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
      <Button
        onMouseDown={() => onmousedown()}
        onMouseUp={() => onmouseup("top")}
        className={`${
          showScrollButton ? "fixed" : "hidden"
        } w-12 p-0  rounded-full right-4 bottom-8  `}
        variant={"ghost"}
      >
        <ArrowCircleUp size={32} />
      </Button>
      <Button
        onMouseDown={() => onmousedown()}
        onMouseUp={() => onmouseup("bottom")}
        className={`${
          !showScrollButton ? "fixed" : "hidden"
        } w-12 p-0  rounded-full right-4 bottom-8  `}
        variant={"ghost"}
      >
        <ArrowCircleDown size={32} />
      </Button>
    </div>
  );
}
