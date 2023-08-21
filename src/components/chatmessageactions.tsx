"use client";
import React, { Dispatch, SetStateAction, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
} from "@/components/ui/dropdownmeu";
import { CaretCircleDown, CaretCircleUp } from "@phosphor-icons/react";
import CopyToClipboard from "@/components/copytoclipboard";
import { MessageRole } from "@/lib/types";

// import { DropdownMenuItem } from "@radix-ui/react-dropdown-menu";
type Props = {
  content: string;
  role: MessageRole;
  setEditing: Dispatch<SetStateAction<boolean>>;
  handleRegenerate: () => void;
};

const ChatMessageActions = (props: Props) => {
  const [open, setOpen] = useState<boolean>(false);
  return (
    <DropdownMenu onOpenChange={() => setOpen((prev) => !prev)}>
      <DropdownMenuTrigger asChild>
        {open ? <CaretCircleUp size={24} /> : <CaretCircleDown size={24} />}
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuGroup>
          <DropdownMenuItem>
            Copy <CopyToClipboard content={props.content} />
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => props.setEditing(true)}>
            Edit
          </DropdownMenuItem>
          {props.role !== "user" && (
            <DropdownMenuItem onClick={() => props.handleRegenerate()}>
              Regenerate
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ChatMessageActions;
