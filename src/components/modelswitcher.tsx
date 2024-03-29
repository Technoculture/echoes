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

export interface InputBarActionProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  aiType: AIType;
  setAIType: Dispatch<SetStateAction<AIType>>;
}

const ModelSwitcher = React.forwardRef<HTMLButtonElement, InputBarActionProps>(
  ({ aiType, setAIType, className, ...props }, ref) => {
    const Comp =
      aiType === "universal" ? (
        <Brain className="h-4 w-4 fill-current" />
      ) : (
        <Dna className="h-4 w-4 fill-current" />
      );

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            {...props}
            className={className}
            ref={ref}
            size="icon"
            variant="outline"
          >
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
              <DropdownMenuRadioItem value="agent">Agent</DropdownMenuRadioItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel inset>AIModels</DropdownMenuLabel>
            </DropdownMenuRadioGroup>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  },
);

ModelSwitcher.displayName = "ModelSwitcher";

export default ModelSwitcher;
