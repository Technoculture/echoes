"use client";

import { Copy, Check } from "iconoir-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/tooltip";

interface CopyToClipboardProps {
  copied: boolean;
}

const CopyToClipboard = (props: CopyToClipboardProps) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger className="bg-secondary group-hover:bg-popover text-primary group-hover:text-primary flex-none p-1 w-fit h-fit mr-2">
          {props.copied ? (
            <Check className="hover:text-primary" height={14} width={14} />
          ) : (
            <Copy className="hover:text-primary" height={14} width={14} />
          )}
        </TooltipTrigger>

        <TooltipContent
          className="data-[state=delayed-open]:data-[side=top]:animate-slideDownAndFade data-[state=delayed-open]:data-[side=right]:animate-slideLeftAndFade data-[state=delayed-open]:data-[side=left]:animate-slideRightAndFade data-[state=delayed-open]:data-[side=bottom]:animate-slideUpAndFade text-xs text-primary select-none rounded bg-ring px-2 py-2 leading-none will-change-[transform,opacity]"
          sideOffset={5}
        >
          Copy
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default CopyToClipboard;
