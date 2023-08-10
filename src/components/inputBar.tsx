"use client";

import TextareaAutosize from "react-textarea-autosize";
import { ChangeEvent, Dispatch, FormEvent, SetStateAction } from "react";
import { ChatRequestOptions, CreateMessage, Message, nanoid } from "ai";
import { Toggle } from "@/components/toogle";
import { Brain, Lightning } from "@phosphor-icons/react";

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
  messages: Message[];
  setMessages: (messages: Message[]) => void;
}

const InputBar = (props: InputBarProps) => {
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const message = {
      role: "user" as const,
      content: props.value,
      name: `${props.username},${props.userId}`,
    };
    if (props.isFast) {
      console.log("appendin");
      props.append(message as Message);
    } else {
      props.setMessages([...props.messages, { ...message, id: nanoid() }]);
      console.log("setting");
      const res = await fetch(
        `https://technoculture-echoes--bioinformatics-ai-web.modal.run?prompt=${props.value}`,
      );
      const data = await res.json();
      const structure = "........";
      const sequence = "ATGCGCGC";
      const minFreeEnergy = 0.0;
      const rna = {
        structure,
        sequence,
        minFreeEnergy,
      };
      const newMessage = {
        id: nanoid(),
        role: "function" as const,
        content: JSON.stringify(data),
      };
      props.setMessages([...props.messages, newMessage]);
      console.log("data", data);
    }
    props.setInput("");
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex bg-linear-900 p-2 pt-2 rounded-sm  ">
        <Toggle
          className="mr-2"
          pressed={props.isFast}
          onPressedChange={() => props.setIsFast(!props.isFast)}
        >
          {props.isFast ? <Brain /> : <Lightning />}
        </Toggle>

        <TextareaAutosize
          maxRows={10}
          placeholder="Type your message here..."
          autoFocus
          value={props.value}
          onChange={props.onChange}
          className="flex-none resize-none rounded-sm grow bg-linear-400 border border-linear-50 text-gray-200 p-2 text-sm"
        />
        <button
          type="submit"
          className="p-2 text-green-400 hover:text-green-100 flex justify-end"
        >
          Send
        </button>
      </div>
    </form>
  );
};

export default InputBar;
