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
  updateRoom: (data: any) => void;
}

const ChatMessage = (props: ChatMessageProps) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editText, setEditText] = useState<string>(props.chat.content);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRegenerating, setIsRegenerating] = useState<boolean>(false);
  const [isActionsOpen, setIsActionsOpen] = useState<boolean>(false);

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
    setIsRegenerating(true);
    console.log("index", index); // got the index

    console.log("role", role); // got the role
    // update local messages using index
    // if role is user => regenerate response and replace the next assistant message
    // if role is !user => update database with corrected text

    if (role === "assistant") {
      try {
        console.log("messages", props.messages);
        console.log("editText", editText);
        // const tempMessages = [...props.messages];

        const tempMessages = structuredClone(props.messages);
        tempMessages[Number(index)].content = editText;
        console.log("tempMessages", tempMessages);
        // const updatedMessages = props.messages.map((message, index) => [message.index, index].includes(props.messageIndex) ? {...message, content: editText} : message)
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
        props.updateRoom(tempMessages);
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
        props.updateRoom(data.updatedMessages);
        console.log("incomingData", data.updatedMessages);
        // console.log("res", await res.json())
      } catch (err) {
        console.log("line 94", err);
      }

      console.log("preMessages", preMessages);
      console.log("postMessages", postMessages);
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
    // e.preventDefault();
    setIsRegenerating(true);
    const id = props.messageIndex; // id of the response to be regenerated

    const tempMessages = structuredClone(props.messages);

    //TODO: handle the case if the user wants to regenerate the last message
    // messages before the response to be regenerated
    const chatToBeSent = tempMessages.slice(0, id); // response is not included
    console.log("chatToBeSent", chatToBeSent);
    console.log("tempMessages", tempMessages);
    const remainingMessages = tempMessages.slice(id + 1);
    console.log("remainingMessages", remainingMessages);

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
      props.updateRoom(data.updatedMessages);
      console.log("incomingData", data.updatedMessages);
      // console.log("res", await res.json())
    } catch (err) {
      console.log(err);
    }

    console.log("regenerating", id);
    setIsRegenerating(false);
    setIsActionsOpen(false);
  };

  return (
    <div
      className={
        "flex-col box-border overflow-hidden p-4 pt-3 pb-3 rounded-sm gap-1 text-sm group hover:bg-secondary bg-background hover:ring-1 ring-ring"
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
          isEditing={isEditing}
          setEditing={setIsEditing}
          role={props.chat.role}
          content={props.chat.content}
          handleRegenerate={handleRegenerate}
          isRegenerating={isRegenerating}
          open={isActionsOpen}
          setOpen={setIsActionsOpen}
        />
      </div>
      {!isEditing ? (
        <div
          className={
            isRegenerating ? "animate-pulse opacity-10 backdrop-blur-md" : ""
          }
        >
          <RenderMarkdown content={props.chat.content} role={props.chat.role} />
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
