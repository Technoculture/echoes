"use client";
import { nanoid } from "ai";
import { useState, useEffect, useCallback } from "react";
import { AIType, ChatType } from "@/lib/types";
import InputBar from "@/components/inputBar";
import { Message, useChat } from "ai/react";
import Startnewchatbutton from "@/components/startnewchatbutton";
import ChatMessageCombinator from "@/components/chatmessagecombinator";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import PersistenceExample from "@/components/tldraw";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "./ui/use-toast";
import { getUserIdList } from "./chatusersavatars";
import { usePresence } from "ably/react";
import { Button } from "./button";
import { useDropzone } from "react-dropzone";

interface ChatProps {
  orgId: string;
  uid: string;
  dbChat: Message[];
  chatId: string;
  username: string;
  org_slug: string;
  chatTitle: string;
  imageUrl: string;
  type: ChatType;
  confidential: number | null;
}

export default function Chat(props: ChatProps) {
  // const { toast} = useToast()

  const [choosenAI, setChoosenAI] = useState<AIType>("universal");
  const [isChatCompleted, setIsChatCompleted] = useState<boolean>(false);
  const [calculatedMessages, setCalculatedMessages] = useState<Message[][]>([]);
  const { presenceData, updateStatus } = usePresence(`channel_${props.chatId}`);
  const [imageInput, setImageInput] = useState<string>("");
  const [dropZone, setDropzone] = useState<boolean>(false);
  const [image, setImage] = useState<File[]>([]); // Initialize state
  const [imageUrl, setImageUrl] = useState<string>("");
  const [imageName, setImageName] = useState<string>("");

  const queryClient = useQueryClient();
  // let imageUrl:any='';

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setImage(acceptedFiles);
    try {
      setImageUrl(URL.createObjectURL(acceptedFiles[0]));
      setImageName(JSON.stringify(acceptedFiles[0].name));

      setDropzone(true);
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  }, []);
  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    noClick: true,
    noKeyboard: true,
  });

  const chatFetcher = async () => {
    const res = await axios.get(`/api/chats/${props.chatId}`);
    const chats = res.data.chats;
    return chats as Message[];
  };
  const {
    data: chatsData,
    isLoading: isChatsLoading,
    isError,
  } = useQuery({
    queryKey: ["chats", props.chatId],
    queryFn: chatFetcher,
    initialData: props.dbChat,
    refetchOnWindowFocus: false,
  });

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
    initialMessages: chatsData,
    body: {
      orgId: props.orgId,
      name: props.username,
      userId: props.uid,
      chattype: props.type,
    },
    onError: (error) => {
      console.log("got the error", error);
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
    setImageInput(input);
    // console.log("imageinput", imageInput);
    if (imageInput && image.length > 0) {
      handleImage();
    }
    // console.log("imagestate", image);
  }, [dropZone]);

  const handleImage = async () => {
    if (image && image.length > 0) {
      console.log("dropzone", dropZone);
      if (props.type === "rag" || "agent" || "univeral" || "chat") {
        setInput("");
        console.log("type", props.type);
        const message: Message = {
          id: nanoid(),
          role: "user",
          content: imageInput,
          name: `${props.username},${props.uid}`,
        };
        const file = image[0];
        const formData = new FormData();
        formData.append("file", file);
        formData.append("imageInput", imageInput);
        console.log("Appended file:", formData.get("file"));
        const response = await fetch("/api/imageInput", {
          method: "POST",
          body: formData,
        });
        const id = nanoid();
        if (response.ok) {
          setMessages([...messages, message]);
          const result = await response.json();
          const assistantMessage: Message = {
            id,
            role: "assistant",
            content: result.result.kwargs.content,
          };
          // console.log("Backend response:", result);
          setMessages([...messages, assistantMessage]);
          console.log("New messages Ok:", messages);
          const content = result.result.kwargs.content;
          fetch(`/api/updatedb/${props.chatId}`, {
            method: "POST",
            body: JSON.stringify({
              messages: [
                ...messages,
                message,
                {
                  ...assistantMessage,
                  content: content,
                },
              ],
              orgId: props.orgId,
              usreId: props.uid,
            }),
          });
        } else {
          console.error(" Response Error :", response);
        }
      }
    }
  };

  useEffect(() => {
    let mainArray: Message[][] = [];
    let subarray: Message[] = [];

    // console.log("messages effect triggered", messages);
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
  }, [messages]);

  const confidentialFetcher = async () => {
    const res = await axios.get(`/api/chats/${props.chatId}/confidential`);
    const confidential = res.data.confidential;
    return confidential as number;
  };

  const { data: confidentiality } = useQuery({
    queryKey: ["confidential", props.chatId],
    queryFn: confidentialFetcher,
    initialData: props.confidential,
    refetchOnWindowFocus: false,
  });

  const userIds = getUserIdList(props.dbChat);

  const {
    mutate: toogleConfidentiality,
    isLoading: isTooglingConfidentiality,
  } = useMutation({
    mutationFn: async ({ confidential }: { confidential: boolean }) => {
      // toogle confidentiality
      const res = await axios.patch(`/api/chats/${props.chatId}/confidential`, {
        confidential,
      });
      return res.data;
    },
    onSuccess: async (data, variables, context) => {
      await queryClient.invalidateQueries(["confidential", props.chatId]);
      await queryClient.invalidateQueries(["chatcards"]);
      toast({
        title: data.message,
      });
    },
    onError(error: any) {
      toast({
        title: `${error.response.data.message}`,
      });
    },
  });

  return (
    <div className="flex flex-col gap-1 mx-auto">
      {props.type === "tldraw" ? (
        <div className=" w-[calc(100dvw-40px)] h-[calc(100dvh-128px)]">
          <PersistenceExample
            org_slug={props.org_slug}
            org_id={props.orgId}
            dbChat={props.dbChat}
            username={props.username}
            chatId={props.chatId}
            uid={props.uid}
          />
        </div>
      ) : (
        // {preferences.showSubRoll && <PersistenceExample />}
        <>
          <section onDrop={(acceptedFiles: any) => onDrop(acceptedFiles)}>
            <div
              // className="justify-center items-center"
              {...getRootProps()}
            >
              <input {...getInputProps()} />
              <ChatMessageCombinator
                calculatedMessages={calculatedMessages}
                messages={messages}
                chatId={props.chatId}
                orgId={props.orgId}
                name={props.username}
                uid={props.uid}
                setMessages={setMessages}
                chatTitle={props.chatTitle}
                imageUrl={props.imageUrl}
                isChatCompleted={isChatCompleted}
                setIsChatCompleted={setIsChatCompleted}
                append={append}
                isLoading={isLoading}
                shouldShowConfidentialToggler={userIds.includes(props.uid)}
                confidential={confidentiality}
                toogleConfidentiality={toogleConfidentiality}
                isTooglingConfidentiality={isTooglingConfidentiality}
              />
            </div>
          </section>
          {/* </div> */}

          {dropZone ? (
            <>
              {" "}
              <div className=" w-[200px] rounded-md bg-slate-950 p-4">
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="w-full h-auto rounded-md"
                />
                <pre>
                  <code className="text-white">{imageName}</code>
                </pre>
                <br></br>
                <Button
                  onClick={() => {
                    setImageInput("");
                    setDropzone(false);
                  }}
                  className="w-40"
                >
                  Undo
                </Button>
              </div>
            </>
          ) : (
            <>{""}</>
          )}

          {isChatCompleted && (
            <div>
              <Startnewchatbutton
                org_slug={props.org_slug}
                org_id={props.orgId}
              />
            </div>
          )}
          <InputBar
            imageInput={imageInput}
            setImageInput={setImageInput}
            dropZone={dropZone}
            setDropzone={setDropzone}
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
            chattype={props.type}
          />
        </>
      )}
    </div>
  );
}
