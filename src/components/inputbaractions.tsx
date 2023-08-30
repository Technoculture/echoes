"use client";
import React, { Dispatch, SetStateAction, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuSeparator,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdownmeu";

import { Button } from "@/components/button";
import { Dna } from "@phosphor-icons/react";

type Position = "top" | "bottom" | "right";

export interface InputBarActionProps {
  position: Position;
  setPosition: Dispatch<SetStateAction<Position>>;
}

// const InputBarActions = React.forwardRef<HTMLButtonElement, InputBarActionProps>((props: Props) => {
const InputBarActions = React.forwardRef<InputBarActionProps>((props) => {
  const [position, setPosition] = useState("top");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" variant="outline">
          <Dna />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuGroup>
          <DropdownMenuRadioGroup value={position} onValueChange={setPosition}>
            <DropdownMenuRadioItem value="top">Universal</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="bottom">
              OpenOligo
            </DropdownMenuRadioItem>
            <DropdownMenuSeparator />
            <DropdownMenuRadioItem value="right">
              AIModels
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
});

InputBarActions.displayName = "InputBarActions";

export default InputBarActions;
