'use client';

import TextareaAutosize from 'react-textarea-autosize';
// import { useRef } from 'react';

const InputBar = () => {
  // const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className='flex gap-2 bg-gray-900 p-2'>
      <TextareaAutosize
        // ref={ inputRef }
        maxRows={ 10 }
        placeholder='Type your message here...'
        autoFocus
        //onKeyPress={ (e) => {
        //  if (e.key === 'Enter' && e.shiftKey)
        //  {
        //    console.log("clicked");
        //    e.preventDefault();
        //  }
        //} }
        className='flex-none resize-none grow bg-gray-900 border rounded border-gray-800 text-gray-200 p-2 text-sm' />
      <button
        onClick={ () => console.log("click") }
        className='p-2 text-green-400  hover:text-green-100 flex justify-end'
      >
        Send
      </button>
    </div >
  );
};

export default InputBar;

