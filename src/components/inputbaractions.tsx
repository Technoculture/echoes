"use client";
import React, { Dispatch, SetStateAction } from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuGroup,
  DropdownMenuSeparator,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdownmeu";

import { Button } from "@/components/button";
import { Dna, Brain } from "@phosphor-icons/react";
import { AIType } from "@/lib/types";

export interface InputBarActionProps {
  aiType: AIType;
  setAIType: Dispatch<SetStateAction<AIType>>;
}

const InputBarActions = ({ aiType, setAIType }: InputBarActionProps) => {
  const Comp = aiType === "universal" ? <Brain /> : <Dna />;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" variant="outline">
          {Comp}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuGroup>
          <DropdownMenuRadioGroup
            value={aiType}
            onValueChange={(value) => setAIType(value as AIType)}
          >
            <DropdownMenuRadioItem value="universal">
              Universal
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="oligoai">
              OligoAI
            </DropdownMenuRadioItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel inset>AIModels</DropdownMenuLabel>
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

InputBarActions.displayName = "InputBarActions";

export default InputBarActions;
