"use client";

import TextareaAutosize from "react-textarea-autosize";
import { ChangeEvent, Dispatch, FormEvent, SetStateAction } from "react";
import { ChatRequestOptions, CreateMessage, Message } from "ai";
import { Toggle } from "@/components/toogle";
import { Brain, Lightning } from "@phosphor-icons/react";
import { CaretCircleUp } from "@phosphor-icons/react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/popover";
import DropFile from "./dropfile";

interface InputBarProps {
  setCollectionName: Dispatch<SetStateAction<string>>;
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
        <div className="w-full relative">
          <TextareaAutosize
            disabled={props.isChatCompleted}
            maxRows={10}
            placeholder="Type your message here..."
            autoFocus
            value={props.value}
            onChange={props.onChange}
            className=" w-full flex-none resize-none rounded-sm grow bg-linear-400 border border-linear-50 text-gray-200 p-2 text-sm"
          />
          <button
            type="button"
            className="absolute right-4 top-2"
            disabled={props.isChatCompleted}
          >
            {/* <CaretCircleUp /> */}
            <Popover>
              <PopoverTrigger disabled={props.isChatCompleted}>
                <CaretCircleUp
                  className={`${props.isChatCompleted ? "text-gray-500" : ""}`}
                  size={24}
                />
              </PopoverTrigger>
              <PopoverContent>
                <DropFile setCollectionName={props.setCollectionName} />
              </PopoverContent>
            </Popover>
          </button>
        </div>
        <button
          type="submit"
          className="p-2 text-green-400 hover:text-green-100 flex justify-end disabled:text-gray-500"
          disabled={props.isChatCompleted}
        >
          Send
        </button>
      </div>
    </form>
  );
};

export default InputBar;
