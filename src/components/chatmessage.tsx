import { Message } from "ai";
import TextareaAutosize from "react-textarea-autosize";
import ChatMessageActions from "@/components/chatmessageactions";
import { useState } from "react";
import RenderMarkdown from "@/components/rendermarkdown";
import { Button } from "@/components/button";
import { MessageRole } from "@/lib/types";
import { CircleNotch } from "@phosphor-icons/react";

interface ChatMessageProps {
  name: string;
  chat: Message;
  uid: string;
  messageIndex: number;
  chatId: string;
  orgId: string;
  messages: Message[];
  setMessages: (messages: Message[]) => void;
}

const ChatMessage = (props: ChatMessageProps) => {
  const [isEditing, setIsEditng] = useState<boolean>(false);
  const [editText, setEditText] = useState<string>(props.chat.content);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  let userName = "";
  if (props?.chat.name) {
    const [name, id] = props.chat.name.split(",");
    userName = name;
  } else {
    if (props.chat.role === "user") {
      userName = props.name;
    } else {
      userName = props.chat.role;
    }
  }

  const onEditComplete = async (e: any, index: number, role: MessageRole) => {
    setIsLoading(true);
    console.log("index", index); // got the index

    console.log("role", role); // got the role
    // update local messages using index
    // if role is user => regenerate response and replace the next assistant message
    // if role is !user => update database with corrected text
    try {
      console.log("messages", props.messages);
      console.log("editText", editText);
      // const tempMessages = [...props.messages];

      const tempMessages = structuredClone(props.messages);
      tempMessages[Number(index)].content = editText;
      console.log("tempMessages", tempMessages);
      // const updatedMessages = props.messages.map((message, index) => [message.index, index].includes(props.messageIndex) ? {...message, content: editText} : message)
      if (role === "assistant") {
        const res = await fetch(`/api/updateChat/${props.chatId}`, {
          method: "post",
          body: JSON.stringify({
            orgId: props.orgId,
            updatedMessages: tempMessages,
            // messageIndex: props.messageIndex,
            // updatedContent: editText
          }),
        });

        console.log("response", await res.json());
        props.setMessages(tempMessages);
      }
    } catch (err) {
      console.log("err", err);
      setEditText(props.chat.content);
    }
    setIsLoading(false);
    setIsEditng(false);
  };

  const handleRegenerate = async () => {
    const id = props.messageIndex; // id of the response to be regenerated

    console.log("regenerating", id);
  };

  return (
    <div
      className={
        "flex-col p-4 pt-3 pb-3 rounded-sm gap-1 text-sm group hover:bg-secondary bg-background hover:ring-1 ring-ring"
      }
    >
      <div className="grow flex justify-between">
        <p
          className={
            props.chat.role === "user"
              ? "text-slate-600 group-hover:text-gray-400 select-none"
              : "text-green-300 group-hover:text-green-200 select-none"
          }
        >
          {userName}
        </p>
        <ChatMessageActions
          setEditing={setIsEditng}
          role={props.chat.role}
          content={props.chat.content}
          handleRegenerate={handleRegenerate}
        />
      </div>
      {!isEditing ? (
        <RenderMarkdown content={props.chat.content} role={props.chat.role} />
      ) : (
        <div className="grid gap-2">
          <TextareaAutosize
            autoFocus={true}
            // defaultValue={props.chat.content}
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          ></TextareaAutosize>
          <Button
            onClick={(e) =>
              onEditComplete(e, props.messageIndex, props.chat.role)
            }
            className="place-self-end"
          >
            {isLoading && <CircleNotch className="w-4 h-4 animate-spin" />}
            Send message
          </Button>
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
