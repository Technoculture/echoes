"use client";

import TextareaAutosize from "react-textarea-autosize";
import {
  ChangeEvent,
  Dispatch,
  FormEvent,
  SetStateAction,
  useEffect,
  useState,
} from "react";
import { ChatRequestOptions, CreateMessage, Message, nanoid } from "ai";
import { Microphone, PaperPlaneTilt } from "@phosphor-icons/react";
import { Button } from "@/components/button";
import ModelSwitcher from "@/components/modelswitcher";
import AudioWaveForm from "@/components/audiowaveform";
import { AIType, ChatType } from "@/lib/types";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePresence } from "ably/react";
import { useQueryClient } from "@tanstack/react-query";
import { fetchEventSource } from "@microsoft/fetch-event-source";
function isJSON(str: any) {
  let obj: any;
  try {
    obj = JSON.parse(str);
  } catch (e) {
    return false;
  }
  if (typeof obj === "number" || obj instanceof Number) {
    return false;
  }
  return !!obj && typeof obj === "object";
}

interface InputBarProps {
  value: string;
  onChange: (
    e: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLTextAreaElement>,
  ) => void;
  choosenAI: AIType;
  setChoosenAI: Dispatch<SetStateAction<AIType>>;
  username: string;
  userId: string;
  append: (
    message: Message | CreateMessage,
    chatRequestOptions?: ChatRequestOptions | undefined,
  ) => Promise<string | null | undefined>;
  setInput: Dispatch<SetStateAction<string>>;
  isChatCompleted: boolean;
  chatId: string;
  messages: Message[];
  orgId: string;
  setMessages: (messages: Message[]) => void;
  isLoading: boolean;
  chattype: ChatType;
}

const InputBar = (props: InputBarProps) => {
  const [isAudioWaveVisible, setIsAudioWaveVisible] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isTranscribing, setIsTranscribing] = useState<boolean>(false);
  const [disableInputs, setDisableInputs] = useState<boolean>(false);
  const [isRagLoading, setIsRagLoading] = useState<boolean>(false);
  const queryClient = useQueryClient();
  // const ably = useAbly();

  // console.log(
  //   "ably",
  //   ably.channels
  //     .get(`channel_${props.chatId}`)
  //     .presence.get({ clientId: `room_${props.chatId}` }),
  // );

  const { presenceData, updateStatus } = usePresence(`channel_${props.chatId}`);
  // using local state for development purposes

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (props.value.trim() === "") {
      return;
    }
    const message: Message = {
      id: nanoid(),
      role: "user",
      content: props.value,
      name: `${props.username},${props.userId}`,
      audio: "",
    };
    console.log("value", props.value);

    if (props.chattype === "rag") {
      setIsRagLoading(true);
      setDisableInputs(true);
      props.setMessages([...props.messages, message]);
      props.setInput("");
      let content = "";
      const id = nanoid();
      const assistantMessage: Message = {
        id,
        role: "assistant",
        content: "",
      };
      let message2 = "";
      try {
        await fetchEventSource(`/api/chatmodel/${props.chatId}}`, {
          method: "POST",

          credentials: "include",
          body: JSON.stringify({
            input: props.value,
            messages: [...props.messages, message],
            userId: props.userId,
            orgId: props.orgId,
            chattype: props.chattype,
            enableStreaming: true,
          }),
          openWhenHidden: true,
          async onopen(response) {
            setDisableInputs(true);
            console.log("events started");
          },
          async onclose() {
            setDisableInputs(false);
            setIsRagLoading(false);
            console.log("event reading closed", message2);
            fetch(`/api/updatedb/${props.chatId}`, {
              method: "POST",
              body: JSON.stringify({
                messages: [
                  ...props.messages,
                  message,
                  {
                    ...assistantMessage,
                    content: content,
                  },
                ],
                orgId: props.orgId,
                usreId: props.userId,
              }),
            }); // TODO: handle echoes is typing
            return;
          },
          async onmessage(event: any) {
            if (event.data !== "[END]" && event.event !== "function_call") {
              message2 += event.data === "" ? `${event.data} \n` : event.data;
              content += event.data === "" ? `${event.data} \n` : event.data;
              props.setMessages([
                ...props.messages,
                message,
                {
                  ...assistantMessage,
                  content: content,
                },
              ]);
            }
          },
          onerror(error: any) {
            console.error("event reading error", error);
          },
        });
        return;
      } catch (error) {
        console.error(error);
        return;
      }
    }
    if (props.choosenAI === "universal") {
      props.append(message as Message);
      props.setInput("");
    }
    if (props.choosenAI === "agent") {
      setDisableInputs(true);
      props.setMessages([...props.messages, message]);
      props.setInput("");
      const res = await fetch(`/api/chatagent/${props.chatId}`, {
        method: "POST",
        body: JSON.stringify({
          messages: [...props.messages, message],
          isFast: true,
          orgId: props.orgId,
        }),
      });
      let content = "";
      const id = nanoid();
      const assistantMessage: Message = {
        id,
        role: "assistant",
        content: "",
      };
      let functionMessages: Message[] = [];

      if (res.body) {
        const reader = res?.body.getReader();
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            console.log("controller closed");
            setDisableInputs(false);
            break;
          }
          const text = new TextDecoder().decode(value);
          if (text.startsWith(`$__JSON_START__`)) {
            const jsonStr = text
              .replace("$__JSON_START__", "")
              .replace("__JSON_END__", "");
            if (isJSON(jsonStr)) {
              console.log("this is json", jsonStr);
              const functionMessage: Message = {
                id: nanoid(),
                role: "function",
                content: jsonStr,
              };
              functionMessages.push(functionMessage);
              props.setMessages([
                ...props.messages,
                message,
                ...functionMessages,
              ]);
            }
          } else {
            console.log("non-json", text);
            content += text;
            props.setMessages([
              ...props.messages,
              message,
              ...functionMessages,
              {
                ...assistantMessage,
                content: content,
              },
            ]);
          }
        }
      }
    }
  };

  const handleAudio = async (audioFile: File) => {
    setIsAudioWaveVisible(false);
    setIsTranscribing(true);
    const f = new FormData();
    f.append("file", audioFile);
    // Buffer.from(audioFile)
    console.log(audioFile);
    try {
      const res = await fetch("/api/transcript", {
        method: "POST",
        body: f,
      });

      // console.log('data', await data.json());
      const data = await res.json();
      console.log("got the data", data);
      props.setInput(data.text);
      setIsTranscribing(false);
    } catch (err) {
      console.error("got in error", err);
      setIsTranscribing(false);
    }
  };

  useEffect(() => {
    if (
      presenceData
        .filter((p) => p.data.id !== props.userId)
        .some((p) => p.data.isTyping)
    ) {
      if (!disableInputs) {
        setDisableInputs(true);
      }
    } else {
      if (disableInputs) {
        setDisableInputs(false);
        queryClient.invalidateQueries(["chats", props.chatId]);
      }
    }
  }, [presenceData]);
  useEffect(() => {
    if (!props.isLoading && !isRagLoading) {
      const timer = setTimeout(() => {
        updateStatus({
          isTyping: false,
          username: props.username,
          id: props.userId,
        });
        // setDisableInputs(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [props.value]);

  useEffect(() => {
    if (props.isLoading || isRagLoading) {
      updateStatus({
        isTyping: true,
        username: "Echo",
        id: props.userId,
      });
      // setDisableInputs(true)
    } else {
      updateStatus({
        isTyping: false,
        username: "Echo",
        id: props.userId,
      });
      // setDisableInputs(false)
    }
  }, [props.isLoading, isRagLoading]);
  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    props.onChange(e);
    updateStatus({
      isTyping: true,
      username: props.username,
      id: props.userId,
    });
    // setDisableInputs(true)
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-grow sm:min-w-[700px]">
      <motion.div
        layout
        className="flex flex-grow bg-linear-900 p-2 pt-2 rounded-sm gap-2 "
      >
        {/* <AnimatePresence> */}
        {isAudioWaveVisible ? (
          <AudioWaveForm
            handleAudio={handleAudio}
            isRecording={isRecording}
            setIsRecording={setIsRecording}
          />
        ) : (
          <motion.div layout className="flex flex-grow w-full gap-2">
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1, transition: { duration: 0.5 } }}
              exit={{ x: -50, opacity: 0, transition: { duration: 0.5 } }}
            >
              <ModelSwitcher
                disabled={
                  props.isChatCompleted ||
                  isRecording ||
                  isTranscribing ||
                  disableInputs
                }
                aiType={props.choosenAI}
                setAIType={props.setChoosenAI}
              />
            </motion.div>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1, transition: { duration: 0.5 } }}
              exit={{ y: 50, opacity: 0, transition: { duration: 0.5 } }}
              className="relative w-full"
            >
              {presenceData.some((p) => p.data.isTyping) && (
                <div className="flex items-center absolute top-[-120%] left-[50%] translate-x-[-50%] h-full z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2">
                  <div className="flex items-center justify-center gap-4 h-8 ">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-ping" />
                    <p className="">
                      <span className="text-foreground">
                        {presenceData.map((p) => p.data.username).join(", ")}
                      </span>{" "}
                      is typing
                    </p>
                  </div>
                </div>
              )}
              <TextareaAutosize
                disabled={
                  props.isChatCompleted ||
                  isRecording ||
                  isTranscribing ||
                  disableInputs
                }
                maxRows={10}
                placeholder={isTranscribing ? "" : "Type your message here..."}
                autoFocus
                value={props.value}
                onChange={handleInputChange}
                className="flex-none resize-none rounded-sm grow w-full bg-background border border-secondary text-primary p-2 text-sm disabled:text-muted"
              />
              <Loader2
                className={cn(
                  "h-4 w-4 animate-spin absolute left-2 top-3",
                  isTranscribing ? "visible" : "hidden",
                )}
              />
            </motion.div>
            <motion.div
              initial={{ x: 20, y: 25, opacity: 0 }}
              animate={{
                x: 0,
                y: 0,
                opacity: 1,
                transition: { duration: 0.5 },
              }}
              exit={{ x: 20, y: 25, opacity: 0, transition: { duration: 0.5 } }}
            >
              <Button
                disabled={isRecording || isTranscribing || disableInputs}
                onClick={() => setIsAudioWaveVisible(true)}
                size="icon"
                variant="secondary"
                type="button"
                className="disabled:text-muted"
              >
                <Microphone
                  className="h-4 w-4 fill-current"
                  color="#618a9e"
                  weight="bold"
                />
              </Button>
            </motion.div>

            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1, transition: { duration: 0.5 } }}
              exit={{ x: 50, opacity: 0, transition: { duration: 0.5 } }}
            >
              <Button
                size="icon"
                variant="secondary"
                disabled={
                  props.isChatCompleted ||
                  isRecording ||
                  isTranscribing ||
                  disableInputs
                }
                type="submit"
                className="disabled:text-muted"
              >
                <PaperPlaneTilt className="h-4 w-4 fill-current" />
              </Button>
            </motion.div>
          </motion.div>
        )}
        {/* </AnimatePresence> */}
      </motion.div>
    </form>
  );
};

export default InputBar;
