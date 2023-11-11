"use client";

import TextareaAutosize from "react-textarea-autosize";
import {
  ChangeEvent,
  Dispatch,
  FormEvent,
  SetStateAction,
  useState,
} from "react";
import { ChatRequestOptions, CreateMessage, Message, nanoid } from "ai";
import { Microphone, PaperPlaneTilt } from "@phosphor-icons/react";
import { Button } from "@/components/button";

import ModelSwitcher from "@/components/modelswitcher";
import AudioWaveForm from "@/components/audiowaveform";
import { AIType } from "@/lib/types";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
function isJSON(str: any) {
  let obj : any;
  try {
    obj = JSON.parse(str);
  } catch (e) {
    return false;
  }
  if (typeof obj === 'number' || obj instanceof Number) {
    return false;
}
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
}

const InputBar = (props: InputBarProps) => {
  const [isAudioWaveVisible, setIsAudioWaveVisible] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isTranscribing, setIsTranscribing] = useState<boolean>(false);

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
    };
    if (props.choosenAI === "universal") {
      props.append(message as Message);
      props.setInput("");
    }
    if (props.choosenAI === "agent") {
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

      // if(res.body){
      //   for await (const chunk of res?.body) {
      //     console.log("chunk is ==>", chunck)
      //     // Do something with the chunk
      //   }
      // }
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
            break;
          }

          const text = new TextDecoder().decode(value);
          if (isJSON(text)) {
            console.log("this is json", text);
            const functionMessage: Message = {
              id: nanoid(),
              role: "function",
              content: text,
            };
            functionMessages.push(functionMessage);

            props.setMessages([
              ...props.messages,
              message,
              ...functionMessages,
            ]);
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
          // console.log('textChunck', functionMessage.content, '\n');
        }
      }

      // const intermediateStepMessages: Message[] = (
      //   data.intermediateSteps ?? []
      // ).map((intermediateStep: AgentStep, i: number) => {
      //   return {
      //     id: nanoid(),
      //     content: JSON.stringify(intermediateStep),
      //     role: "function",
      //   } as Message;
      // });

      // const functionMessage: Message = {
      //   id: nanoid(),
      //   role: "assistant",
      //   content: content,
      // };
      // props.setMessages([
      //   ...props.messages,
      //   message,
      //   // ...intermediateStepMessages,
      //   functionMessage,
      // ]);
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

  return (
    <form onSubmit={handleSubmit} className="flex flex-grow">
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
                  props.isChatCompleted || isRecording || isTranscribing
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
              <TextareaAutosize
                disabled={
                  props.isChatCompleted || isRecording || isTranscribing
                }
                maxRows={10}
                placeholder={isTranscribing ? "" : "Type your message here..."}
                autoFocus
                value={props.value}
                onChange={props.onChange}
                className="flex-none resize-none rounded-sm grow w-full bg-linear-400 border border-linear-50 text-gray-200 p-2 text-sm disabled:text-muted"
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
                disabled={isRecording || isTranscribing}
                onClick={() => setIsAudioWaveVisible(true)}
                size="icon"
                variant="outline"
                type="button"
                className="text-blue-400 hover:text-green-100 disabled:text-muted"
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
                variant="outline"
                disabled={
                  props.isChatCompleted || isRecording || isTranscribing
                }
                type="submit"
                className=" text-green-400 hover:text-green-100 disabled:text-muted"
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
