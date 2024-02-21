"use client";
import { Message } from "ai";
import TextareaAutosize from "react-textarea-autosize";
import ChatMessageActions from "@/components/chatmessageactions";
import { useState } from "react";
import RenderMarkdown from "@/components/rendermarkdown";
import { Button } from "@/components/button";
import { MessageRole } from "@/lib/types";
import { CircleNotch } from "@phosphor-icons/react";
import { IntermediateStep } from "./intermediatesteps";
import useStore from "@/store";
import AudioButton from "@/components/audioButton";
// import "./audio.css";

interface ChatMessageProps {
  name: string;
  chat: Message;
  uid: string;
  messageIndex: number;
  chatId: string;
  orgId: string;
  messages: Message[];
  setMessages: (messages: Message[]) => void;
  chatTitle: string;
  imageUrl: string;
  isLoading: boolean;
}

const ChatMessage = (props: ChatMessageProps) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editText, setEditText] = useState<string>(props.chat.content);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRegenerating, setIsRegenerating] = useState<boolean>(false);
  const [isActionsOpen, setIsActionsOpen] = useState<boolean>(false);
  const [audioSrc, setAudioSrc] = useState<string>(props.chat.audio || "");
  const store = useStore();

  let userName = "";
  if (props?.chat.name) {
    const [name, id] = props.chat.name.split(",");
    userName = name;
  } else {
    if (props.chat.role === "user" && props.chat.subRole == "input-image") {
      userName = "";
    } else if (props.chat.role === "assistant") {
      userName = "Echo";
    } else {
      userName = props.chat.role;
    }
  }

  const onEditComplete = async (e: any, index: number, role: MessageRole) => {
    setIsLoading(true);
    setIsRegenerating(true);

    if (role === "assistant") {
      try {
        const tempMessages = structuredClone(props.messages);
        tempMessages[Number(index)].content = editText;
        const res = await fetch(`/api/updateChat/${props.chatId}`, {
          method: "post",
          body: JSON.stringify({
            orgId: props.orgId,
            updatedMessages: tempMessages,
          }),
        });

        props.setMessages(tempMessages);
      } catch (err) {
        console.log("err", err);
        setEditText(props.chat.content);
      }
    } else {
      const preMessages = props.messages.slice(0, index + 1); // including the edited one
      preMessages[preMessages.length - 1].content = editText;
      const postMessages = props.messages.slice(index + 2);

      try {
        const res = await fetch(`/api/regenerate/${props.chatId}`, {
          method: "post",
          body: JSON.stringify({
            preMessages: preMessages,
            postMessages: postMessages,
          }),
        });

        const data = await res.json();
        props.setMessages(data.updatedMessages);
      } catch (err) {
        console.log("line 94", err);
      }
    }

    setIsLoading(false);
    setIsEditing(false);
    setIsRegenerating(false);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditText(props.chat.content);
  };

  const handleRegenerate = async (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
  ) => {
    setIsRegenerating(true);
    const id = props.messageIndex; // id of the response to be regenerated
    const tempMessages = structuredClone(props.messages);
    const chatToBeSent = tempMessages.slice(0, id); // response is not included
    const remainingMessages = tempMessages.slice(id + 1);

    try {
      const res = await fetch(`/api/regenerate/${props.chatId}`, {
        method: "post",
        body: JSON.stringify({
          preMessages: chatToBeSent,
          postMessages: remainingMessages,
        }),
      });

      const data = await res.json();
      props.setMessages(data.updatedMessages);
    } catch (err) {
      console.log(err);
    }

    setIsRegenerating(false);
    setIsActionsOpen(false);
  };

  return (
    <div
      className={
        "flex-col flex-grow overflow-hidden p-4 pt-3 pb-3 rounded-sm gap-1 text-sm group dark:hover:bg-zinc-900 hover:bg-zinc-100 bg-background"
      }
    >
      <div className="grow flex justify-between ">
        <div className="flex items-center gap-2">
          <p
            className={
              props.chat.role === "user"
                ? "text-zinc-500 group-hover:text-zinc-400 select-none text-xs"
                : "dark:text-green-700 text-green-700 group-hover:text-green-400 select-none text-xs"
            }
          >
            {userName}
          </p>

          {props.chat.role === "assistant" ? (
            <div className="flex items-center flex-grow">
              {!(
                props.messageIndex === props.messages.length - 1 &&
                props.isLoading
              ) && (
                <AudioButton
                  setMessages={props.setMessages}
                  audio={props.chat.audio as string}
                  chatId={props.chatId}
                  chatTitle={props.chatTitle}
                  description={props.chat.content}
                  id={props.chat.id}
                  imageUrl={props.imageUrl}
                  summarize={false}
                  orgId={props.orgId}
                  variant="ghost"
                  size="sm"
                  className="text-xs"
                  messageIndex={props.messageIndex}
                />
              )}
            </div>
          ) : null}
        </div>
        {props.chat.role !== "function" ? (
          <ChatMessageActions
            isEditing={isEditing}
            setEditing={setIsEditing}
            role={props.chat.role}
            content={props.chat.content}
            handleRegenerate={handleRegenerate}
            isRegenerating={isRegenerating}
            open={isActionsOpen}
            setOpen={setIsActionsOpen}
          />
        ) : null}
      </div>
      {props.chat.role === "function" ? (
        <IntermediateStep message={props.chat} />
      ) : !isEditing ? (
        <div
          id={props.chat.id}
          className={
            isRegenerating ? "animate-pulse opacity-10 backdrop-blur-md" : ""
          }
        >
          {props.chat.subRole === "input-image" ? null : (
            <RenderMarkdown
              content={props.chat.content}
              role={props.chat.role}
            />
          )}
        </div>
      ) : (
        <div
          className={`grid gap-2 ${
            isRegenerating ? "animate-pulse opacity-10 backdrop-blur-md" : ""
          } `}
        >
          <TextareaAutosize
            autoFocus={true}
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          ></TextareaAutosize>
          <div className="flex gap-2 place-self-end">
            <Button
              onClick={(e) =>
                onEditComplete(e, props.messageIndex, props.chat.role)
              }
            >
              {isLoading && (
                <CircleNotch className="w-4 h-4 mr-2 animate-spin" />
              )}
              Save{props.chat.role === "user" && " and Regenerate"}
            </Button>
            <Button onClick={cancelEditing}>Cancel</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
