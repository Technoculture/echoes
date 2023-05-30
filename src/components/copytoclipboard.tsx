'use client';

import { useState } from 'react';

import { Copy, Check } from 'iconoir-react';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/tooltip"

interface CopyToClipboardProps {
  content: string;
}

const CopyToClipboard = (props: CopyToClipboardProps) => {
  const [copied, setCopied] = useState<boolean>(false);

  const copyToClipboard = (copyText: string) => {
    // NOTE: `navigator.clipboard` is supported in secure contexts only
    // Won't work in localhost
    // https://stackoverflow.com/questions/71873824/copy-text-to-clipboard-cannot-read-properties-of-undefined-reading-writetext
    navigator.clipboard.writeText(copyText.trim()).then(() => {
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    }).catch((err) => {
      console.error(err);
    });
  };

  return (
    <TooltipProvider>
      <Tooltip>

        <TooltipTrigger>
          <button onClick={() => copyToClipboard(props.content)} className="bg-blue-900 group-hover:bg-blue-800 text-blue-400 group-hover:text-blue-50 flex-none p-1 w-fit h-fit">
            {copied ? <Check className="hover:text-green-200" height={14} width={14} /> : <Copy className="hover:text-green-200" height={14} width={14} />}
          </button>
        </TooltipTrigger>

        <TooltipContent
          className="data-[state=delayed-open]:data-[side=top]:animate-slideDownAndFade data-[state=delayed-open]:data-[side=right]:animate-slideLeftAndFade data-[state=delayed-open]:data-[side=left]:animate-slideRightAndFade data-[state=delayed-open]:data-[side=bottom]:animate-slideUpAndFade text-xs text-blue-900 select-none rounded bg-green-300 px-2 py-2 leading-none will-change-[transform,opacity]"
          sideOffset={5}
        >
          Copy
        </TooltipContent>

      </Tooltip>
    </TooltipProvider>
  );
};

export default CopyToClipboard;
