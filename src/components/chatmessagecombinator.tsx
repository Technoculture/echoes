import React, { SetStateAction } from "react";
import Image from "next/image";
import { ContextWrapper } from "@/components/contextwrapper";
import { ChatRequestOptions, CreateMessage, Message } from "ai";
import { CHAT_COMPLETION_CONTENT } from "@/lib/types";
import ChatMessage from "@/components/chatmessage";
import { cn } from "@/lib/utils";
import { Button } from "@/components/button";
import PatentData from "@/components/patentdata";
import usePreferences from "@/store/userPreferences";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import axios from "axios";
import { Skeleton } from "@/components/ui/skeleton";
import { LockClosedIcon, LockOpen1Icon } from "@radix-ui/react-icons";
import { Loader2 } from "lucide-react";

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
  isChatCompleted: boolean;
  setIsChatCompleted: React.Dispatch<SetStateAction<boolean>>;
  append: (
    message: Message | CreateMessage,
    chatRequestOptions?: ChatRequestOptions | undefined,
  ) => Promise<string | null | undefined>;
  isLoading: boolean;
  shouldShowConfidentialToggler: boolean;
  confidential: number | null;
  toogleConfidentiality: (confidential: { confidential: boolean }) => void;
  isTooglingConfidentiality: boolean;
};

const ChatMessageCombinator = ({
  calculatedMessages,
  messages,
  name,
  isChatCompleted,
  setIsChatCompleted,
  append,
  setMessages,
  chatId,
  chatTitle,
  orgId,
  uid,
  imageUrl,
  isLoading,
  shouldShowConfidentialToggler,
  confidential,
  toogleConfidentiality,
  isTooglingConfidentiality,
}: Props) => {
  let url = "";
  let id = "";

  const preferences = usePreferences();
  const queryClient = useQueryClient();
  // const [imageRender, setImageRender] = useState("");
  const mutation = useMutation(
    async (data: { id: string; msgs: Message[]; lastMessageIndex: number }) => {
      const res = await axios.post(`/api/patentsearch`, {
        msgs: data.msgs,
        orgId: orgId,
        chatId: chatId,
        lastMessageIndex: data.lastMessageIndex,
      });
      const result = res.data;
    },
    {
      onSuccess: () => {
        // Invalidate and refetch
        queryClient.invalidateQueries(["chats", chatId]);
      },
    },
  );

  const titleSplit = chatTitle.replaceAll('"', "").split(":");
  const chat_title = titleSplit[0];
  const chat_sub_title = titleSplit.length > 1 ? titleSplit[1] : "";

  let messageIndex = 0;
  return (
    <div>
      <div className="grid grid-cols-1 gap-2">
        <div className="max-w-[700px] grid grid-cols-1 xl:max-w-none xl:grid-flow-col gap-2 mx-auto my-4">
          <div className="xl:w-[450px] flex justify-evenly">
            {imageUrl && imageUrl !== "" ? (
              <Image
                src={imageUrl}
                width={400}
                height={300}
                alt={chat_title}
                className="rounded-xl w-42 object-cover shadow-lg"
              />
            ) : null}
          </div>
          <div className="xl:w-[700px] flex-col mt-auto">
            {/* {confidential ? <Button><LockClosedIcon /></Button>: <Button variant="destructive"><LockOpen1Icon /></Button>} */}
            {chat_title !== "" ? (
              <>
                <h1 className="scroll-m-20 text-3xl font-extrabold tracking-tight lg:text-4xl">
                  {chat_title}
                </h1>
                {/*
            <AudioButton
              chatId={String(chatId)} // id to recognise chat
              chatTitle={chatTitle}
              // description={description}
              id={String(chatId)} // id for the track
              imageUrl={imageUrl}
              messages={messages}
              summarize={true}
              orgId={orgId}
              // audio={chat.audio}
              variant="ghost"
              size="sm"
              className="text-xs h-[32px]"
            />
            */}
              </>
            ) : null}
            {chat_sub_title !== "" ? (
              <h2 className="scroll-m-20 pb-2 text-2xl tracking-tight first:mt-0">
                {chat_sub_title}
              </h2>
            ) : null}
            {shouldShowConfidentialToggler && (
              <Button
                onClick={() =>
                  toogleConfidentiality({ confidential: !confidential })
                }
                variant={!confidential ? "default" : "destructive"}
              >
                {isTooglingConfidentiality ? (
                  <div className="flex gap-2 items-center">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Updating</span>
                  </div>
                ) : confidential ? (
                  <div className="flex gap-2 items-center">
                    <LockClosedIcon className="h-4 w-4" />
                    <span>Confidential</span>
                  </div>
                ) : (
                  <div className="flex gap-2 items-center">
                    <LockOpen1Icon className="h-4 w-4" />
                    <span>Non-Confidential</span>
                  </div>
                )}
              </Button>
            )}
          </div>
        </div>

        {calculatedMessages.map((msgs, index) => {
          const patentMessage = msgs.find((msg) => {
            msg.subRole === "patent-search";
          });
          const imageMessage: any = msgs.find((msg) => {
            if (msg.subRole === "image") {
              url = msg.content;
              id = msg.id;
            }
            msg.subRole === "image";
            return msg.subRole;
          });
          // const userMessage: any = msgs.find((msg) => {
          //   msg.role === "user";
          //   return msg.role === "user";
          // });
          // const assiatantMessage: any = msgs.find((msg) => {
          //   msg.role === "assistant";
          //   return msg.role === "assistant";
          // });
          console.log("data", msgs);
          // console.log("imageMessage", SubRole);
          // console.log("userMessage", userMessage.name);
          // console.log("assistantMessage", assiatantMessage?.role);

          return (
            <div
              key={index}
              className={cn(
                "max-w-[700px] grid grid-cols-1 xl:max-w-none xl:grid-flow-col gap-2 mx-auto ",
              )}
            >
              {msgs.map((msg, idx) => {
                if (index === messages.length - 1 && !isChatCompleted) {
                  if (messages[index].content === CHAT_COMPLETION_CONTENT) {
                    setIsChatCompleted(true);
                  }
                }

                messageIndex++;
                const msgIdx = messageIndex;
                if (msg.subRole === "patent-search") return null;
                // if (msg.subRole === "image") {
                //   return (
                //     <div key={msg.id}>
                //       <Image
                //         key={msg.id}
                //         alt="image"
                //         src={msg.content}
                //         width={100}
                //         height={100}
                //       ></Image>
                //     </div>
                //   );
                // }

                return (
                  <div
                    key={msg.id || index}
                    className={cn(idx === 0 ? "xl:w-[450px]" : "xl:w-[700px]")}
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
                        chatTitle={chatTitle}
                        imageUrl={imageUrl}
                        isLoading={isLoading}
                      />
                    </ContextWrapper>
                    {msg.name && id == msg.id ? (
                      <div key={msg.id}>
                        <Image
                          key={msg.id}
                          alt="image"
                          src={url}
                          width={150}
                          height={150}
                        ></Image>
                      </div>
                    ) : null}
                    <div>
                      {idx === 0 ? (
                        preferences.showSubRoll ? (
                          patentMessage ? (
                            <PatentData index={index} message={patentMessage} />
                          ) : (
                            <div>
                             {msg.subRole==="image"?null :<Button
                                disabled={mutation.isLoading}
                                onClick={() =>
                                  mutation.mutate({
                                    id: msg.id,
                                    msgs: msgs,
                                    lastMessageIndex: msgIdx,
                                  })
                                }
                                className={cn(
                                  "mx-4 my-3",
                                  isLoading && "hidden",
                                )}
                              >
                                {mutation.isLoading &&
                                mutation.variables?.id === msg.id ? (
                                  <div>
                                    <div className="w-[150px]">
                                      <Skeleton className=" w-[150px] h-[225px] rounded object-cover" />
                                    </div>
                                    <Skeleton className="scroll-m-20 tracking-tight text-xs line-clamp-2 w-[150px]"></Skeleton>
                                  </div>
                                ) : (
                                  "Search For Patents"
                                )}
                              </Button>}
                            </div>
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
