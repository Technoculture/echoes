import React, { SetStateAction } from "react";
import { ContextWrapper } from "@/components/contextwrapper";
import { ChatRequestOptions, CreateMessage, Message } from "ai";
import { CHAT_COMPLETION_CONTENT } from "@/lib/types";
import ChatMessage from "@/components/chatmessage";

type Props = {
  calculatedMessages: Message[][];
  messages: Message[];
  chatId: string;
  orgId: string;
  uid: string;
  name: string;
  chatTitle: string;
  imageUrl: string;
  setMessages: (messages: Message[]) => void;
  updateRoomData: (data: any) => void;
  isChatCompleted: boolean;
  setIsChatCompleted: React.Dispatch<SetStateAction<boolean>>;
  append: (
    message: Message | CreateMessage,
    chatRequestOptions?: ChatRequestOptions | undefined
  ) => Promise<string | null | undefined>;
};

const ChatMessageCombinator = ({
  calculatedMessages,
  messages,
  name,
  isChatCompleted,
  setIsChatCompleted,
  append,
  setMessages,
  updateRoomData,
  chatId,
  chatTitle,
  orgId,
  uid,
  imageUrl,
}: Props) => {
  return (
    <div>
      <div className="grid grid-cols-1 gap-2">
        {calculatedMessages.map((msgs, index) => {
          return (
            <div
              key={index}
              className="max-w-[700px] grid grid-cols-1 xl:max-w-none xl:grid-cols-2"
            >
              {msgs.map((msg, idx) => {
                if (index === messages.length - 1 && !isChatCompleted) {
                  // track a state to disable all the fields
                  if (messages[index].content === CHAT_COMPLETION_CONTENT) {
                    setIsChatCompleted(true);
                  }
                }
                return (
                  <ContextWrapper
                    append={append}
                    username={name}
                    userId={uid}
                    key={msg.id || index}
                  >
                    <ChatMessage
                      // calculate the index to be same as if calculatedMessages were
                      messageIndex={index + idx + 1} // needs to be updated
                      chatId={chatId}
                      orgId={orgId}
                      uid={uid}
                      name={name}
                      chat={msg as Message}
                      key={msg.id || index}
                      messages={messages}
                      setMessages={setMessages}
                      updateRoom={updateRoomData}
                      chatTitle={chatTitle}
                      imageUrl={imageUrl}
                    />
                  </ContextWrapper>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ChatMessageCombinator;
