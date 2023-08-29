"use client";

import TextareaAutosize from "react-textarea-autosize";
import {
  ChangeEvent,
  Dispatch,
  FormEvent,
  SetStateAction,
  useState,
} from "react";
import { ChatRequestOptions, CreateMessage, Message } from "ai";
import { Toggle } from "@/components/toogle";
import { Brain, Lightning, Microphone } from "@phosphor-icons/react";
import AudioDrawer from "@/components/audiodrawer";

interface InputBarProps {
  value: string;
  onChange: (
    e: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLTextAreaElement>,
  ) => void;
  isFast: boolean;
  setIsFast: (arg0: boolean) => void;
  username: string;
  userId: string;
  append: (
    message: Message | CreateMessage,
    chatRequestOptions?: ChatRequestOptions | undefined,
  ) => Promise<string | null | undefined>;
  setInput: Dispatch<SetStateAction<string>>;
  isChatCompleted: boolean;
}

const InputBar = (props: InputBarProps) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const message = {
      role: "user",
      content: props.value,
      name: `${props.username},${props.userId}`,
    };
    props.append(message as Message);
    props.setInput("");
  };

  const handleAudio = async (audioFile: File, shouldSubmit: boolean) => {
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
      setIsDrawerOpen(false);
    } catch (err) {
      console.log("got in error", err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex bg-linear-900 p-2 pt-2 rounded-sm  ">
        <Toggle
          disabled={props.isChatCompleted}
          className="mr-2"
          pressed={props.isFast}
          onPressedChange={() => props.setIsFast(!props.isFast)}
        >
          {props.isFast ? <Brain /> : <Lightning />}
        </Toggle>

        <div className="relative w-full">
          <TextareaAutosize
            disabled={props.isChatCompleted}
            maxRows={10}
            placeholder="Type your message here..."
            autoFocus
            value={props.value}
            onChange={props.onChange}
            className="flex-none resize-none rounded-sm grow bg-linear-400 border border-linear-50 text-gray-200 p-2 text-sm w-full"
          />
          <button
            onClick={() => setIsDrawerOpen(true)}
            type="button"
            className="p-2 text-green-400 hover:text-green-100 absolute right-8"
          >
            <Microphone size={24} color="#618a9e" weight="bold" />
          </button>
        </div>
        {isDrawerOpen && (
          <AudioDrawer
            isRecording={isRecording}
            setIsRecording={setIsRecording}
            isOpen={isDrawerOpen}
            setIsOpen={setIsDrawerOpen}
            submitAudio={handleAudio}
          />
        )}
        <button
          disabled={props.isChatCompleted}
          type="submit"
          className="p-2 text-green-400 hover:text-green-100 flex justify-end disabled:text-gray-500"
        >
          Send
        </button>
      </div>
    </form>
  );
};

export default InputBar;
