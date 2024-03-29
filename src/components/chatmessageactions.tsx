"use client";
import React, { Dispatch, SetStateAction } from "react";
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
import useClipboard from "@/lib/useClipboard";

type Props = {
  content: string;
  role: MessageRole;
  isEditing: boolean;
  setEditing: Dispatch<SetStateAction<boolean>>;
  handleRegenerate: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  isRegenerating: boolean;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
};

const ChatMessageActions = (props: Props) => {
  const { copied, copyToClipboard } = useClipboard();
  return (
    <DropdownMenu
      open={props.open}
      onOpenChange={() => props.setOpen((prev) => !prev)}
    >
      <DropdownMenuTrigger asChild>
        <Button size="xs" variant="ghost">
          <DotsThreeVertical />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => copyToClipboard(props.content)}>
            <CopyToClipboard copied={copied} /> Copy
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => props.setEditing(true)}>
            <div className="bg-secondary group-hover:bg-popover text-primary group-hover:text-primary flex-none p-1 w-fit h-fit mr-2">
              <NotePencil width={14} height={14} />
            </div>{" "}
            Edit
          </DropdownMenuItem>
          {props.role !== "user" && (
            <DropdownMenuItem onClick={(e) => props.handleRegenerate(e)}>
              <div className="bg-secondary group-hover:bg-popover text-primary group-hover:text-primary flex-none p-1 w-fit h-fit mr-2">
                <ArrowsClockwise
                  width={14}
                  height={14}
                  className={`${
                    props.isRegenerating && !props.isEditing
                      ? "animate-spin"
                      : ""
                  }`}
                />
              </div>{" "}
              Regenerate
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ChatMessageActions;
