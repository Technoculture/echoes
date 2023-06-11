'use client';

import TextareaAutosize from 'react-textarea-autosize';
import { useRef } from 'react';

interface InputBarProps {
  onSubmit: (text: string) => void;
}

const sendNewMessageClicked = (props: InputBarProps, ref: React.RefObject<HTMLTextAreaElement>) => {
  let val = ref.current?.value;
  //console.log(val);
  if (val) {
    props.onSubmit(val);
    ref.current!.value = '';
  }
}

const InputBar = (props: InputBarProps) => {
  const inputRef = useRef<HTMLTextAreaElement>(null);

  return (
    <div className='flex bg-linear-900 p-2 pt-2 rounded-sm'>
      <TextareaAutosize
        ref={inputRef}
        maxRows={10}
        placeholder='Type your message here...'
        autoFocus
        onKeyPress={(e) => {
          if (e.key === 'Enter' && e.shiftKey) {
            sendNewMessageClicked(props, inputRef);
            e.preventDefault();
          }
        }}
        className='flex-none resize-none rounded-sm grow bg-linear-400 border border-linear-50 text-gray-200 p-2 text-sm' />
      <button
        onClick={() => {
          sendNewMessageClicked(props, inputRef);
        }}
        className='p-2 text-green-400 hover:text-green-100 flex justify-end'
      >
        Send
      </button>
    </div >
  );
};

export default InputBar;

