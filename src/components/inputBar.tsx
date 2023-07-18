"use client";

import TextareaAutosize from "react-textarea-autosize";
import { ChangeEvent, FormEvent } from "react";
import { ChatRequestOptions } from "ai";
import { Switch } from "./switch";

interface InputBarProps {
  value: string;
  onChange: (
    e: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLTextAreaElement>,
  ) => void;
  onSubmit: (
    e: FormEvent<HTMLFormElement>,
    chatRequestOptions?: ChatRequestOptions | undefined,
  ) => void;
  isFast: boolean;
  setIsFast: (arg0: boolean) => void;
}

const InputBar = (props: InputBarProps) => {
  return (
    <form onSubmit={props.onSubmit}>
      <div className="flex flex-col sm:flex-row  bg-linear-900 p-2 pt-2 rounded-sm  sm:items-center">
        <div className="mr-2 align-middle flex mb-2 sm:mb-0">
          <span>🐢</span>
          <Switch
            checked={props.isFast}
            onCheckedChange={() => props.setIsFast(!props.isFast)}
          />
          <span>🐇</span>
        </div>
        <div className="flex w-full">
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
      </div>
    </form>
  );
};

export default InputBar;
