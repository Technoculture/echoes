import React, { SetStateAction } from "react";
import { ContextWrapper } from "@/components/contextwrapper";
import { ChatRequestOptions, CreateMessage, Message } from "ai";
import { CHAT_COMPLETION_CONTENT } from "@/lib/types";
import ChatMessage from "@/components/chatmessage";
import { cn } from "@/lib/utils";
import { Button } from "@/components/button";
import PatentData from "@/components/patentdata";
import { Loader2 } from "lucide-react";
import usePreferences from "@/store/userPreferences";

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
    chatRequestOptions?: ChatRequestOptions | undefined,
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
  const [isPatentSearch, setIsPatentSearch] = React.useState<boolean>(false);
  const preferences = usePreferences();
  const handlePatentSearch = async ({
    id,
    msgs,
    lastMessageIndex,
  }: {
    id: string;
    msgs: Message[];
    lastMessageIndex: number;
  }) => {
    // console.log("id", id);
    // console.log("msgs", msgs);

    const query = msgs.map((msg) => msg.content).join(" ");
    // console.log("uery", query);
    setIsPatentSearch(true);

    const res = await fetch(`/api/patentsearch`, {
      method: "POST",
      body: JSON.stringify({
        msgs: msgs,
        orgId: orgId,
        chatId: chatId,
        lastMessageIndex: lastMessageIndex,
      }),
    });

    const data = await res.json();

    // console.log("data", data);

    setMessages(data.data);
    updateRoomData(data.data);
    setIsPatentSearch(false);
  };

  let messageIndex = 0;
  return (
    <div>
      <div className="grid grid-cols-1 gap-2 ">
        {calculatedMessages.map((msgs, index) => {
          const patentMessage = msgs.find(
            (msg) => msg.subRole === "patent-search",
          );
          return (
            <div
              key={index}
              className={cn(
                "max-w-[700px]  grid grid-cols-1 xl:max-w-none xl:grid-cols-2 gap-2 ",
              )}
            >
              {msgs.map((msg, idx) => {
                if (index === messages.length - 1 && !isChatCompleted) {
                  // track a state to disable all the fields
                  if (messages[index].content === CHAT_COMPLETION_CONTENT) {
                    setIsChatCompleted(true);
                  }
                }
                messageIndex++;
                const msgIdx = messageIndex;
                if (msg.subRole === "patent-search") return null;
                return (
                  <div
                    key={msg.id || index}
                    // className={cn(
                    //   idx !== 0 &&
                    //     "sticky top-0 max-h-screen overflow-y-scroll",
                    // )}
                  >
                    <ContextWrapper
                      append={append}
                      username={name}
                      userId={uid}
                      key={msg.id || index}
                    >
                      <ChatMessage
                        // calculate the index to be same as if calculatedMessages were
                        messageIndex={msgIdx} // needs to be updated
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
                    <div
                    // className={cn("hidden xl:block")}
                    >
                      {idx === 0 ? (
                        preferences.showSubRoll ? (
                          patentMessage ? (
                            // <div>{patentMessage.content}</div>
                            <PatentData message={patentMessage} />
                          ) : (
                            <Button
                              disabled={isPatentSearch}
                              onClick={() =>
                                handlePatentSearch({
                                  id: msg.id,
                                  msgs: msgs,
                                  lastMessageIndex: msgIdx,
                                })
                              }
                            >
                              {isPatentSearch ? (
                                <>
                                  <Loader2 className="mr-2 animate-spin" />{" "}
                                  Searching...
                                </>
                              ) : (
                                "Search For Patents"
                              )}
                            </Button>
                          )
                        ) : null
                      ) : null}
                    </div>
                  </div>
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
