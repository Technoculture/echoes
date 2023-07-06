'use client';

import TextareaAutosize from 'react-textarea-autosize';
import {ChangeEvent, FormEvent, useRef} from 'react';
import { ChatRequestOptions } from 'ai';

interface InputBarProps {
  value: string
  onChange: (
    e: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLTextAreaElement>
  ) => void;
  onSubmit: (
    e: FormEvent<HTMLFormElement>,
    chatRequestOptions?: ChatRequestOptions | undefined
  ) => void;
}


const InputBar = (props: InputBarProps) => {

  return (
    <form onSubmit={props.onSubmit} >
      <div className="flex bg-linear-900 p-2 pt-2 rounded-sm">
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
