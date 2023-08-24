"use client";
import React, { Dispatch, SetStateAction, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
} from "@/components/ui/dropdownmeu";
import {
  DotsThreeVertical,
  NotePencil,
  ArrowsClockwise,
} from "@phosphor-icons/react";
import CopyToClipboard from "@/components/copytoclipboard";
import { MessageRole } from "@/lib/types";
import { Button } from "@/components/button";

type Props = {
  content: string;
  role: MessageRole;
  setEditing: Dispatch<SetStateAction<boolean>>;
  handleRegenerate: () => void;
};

const ChatMessageActions = (props: Props) => {
  const [open, setOpen] = useState<boolean>(false);
  return (
    <DropdownMenu open={open} onOpenChange={() => setOpen((prev) => !prev)}>
      <DropdownMenuTrigger asChild>
        <Button size={"sm"} variant="ghost" className="px-1 h-4">
          <DotsThreeVertical />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <CopyToClipboard content={props.content} /> Copy
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => props.setEditing(true)}>
            <NotePencil className="bg-secondary group-hover:bg-popover text-primary group-hover:text-primary flex-none p-1 w-fit h-fit mr-1" />{" "}
            Edit
          </DropdownMenuItem>
          {props.role !== "user" && (
            <DropdownMenuItem onClick={() => props.handleRegenerate()}>
              <ArrowsClockwise className="bg-secondary group-hover:bg-popover text-primary group-hover:text-primary flex-none p-1 w-fit h-fit mr-1" />{" "}
              Regenerate
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ChatMessageActions;
