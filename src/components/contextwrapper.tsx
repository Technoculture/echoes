import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuShortcut,
} from "@/components/contextmenu";
import { useTextSelection } from "@mantine/hooks";
import { ChatRequestOptions, CreateMessage, Message } from "ai";
import { ReactNode, useEffect, useState } from "react";

import { PromptTemplate } from "langchain/prompts";
import { predefinedPrompts } from "@/utils/constants";
import { PromptTypes } from "@/lib/types";
// import { Dispatch, SetStateAction } from "react";

type Props = {
  children: ReactNode;
  append: (
    message: Message | CreateMessage,
    chatRequestOptions?: ChatRequestOptions | undefined,
  ) => Promise<string | null | undefined>;
  username: string;
  userId: string;
};

export function ContextWrapper(props: Props) {
  const [selectionText, setSelectionText] = useState("");
  const selection = useTextSelection();

  useEffect(() => {
    if (selection && selection.toString().trim().length > 0) {
      setSelectionText(selection.toString().trim());
    }
    if (selection?.toString().length === 0) {
      setTimeout(() => {
        setSelectionText("");
      }, 300);
    }
  }, [selection?.toString()]);

  const handleSubmit = async (e: any, promptType: PromptTypes) => {
    if (selectionText) {
      let template = PromptTemplate.fromTemplate(`{prompt}"{selection}"`);
      let prompt = await template.format({
        prompt: predefinedPrompts[promptType],
        selection: selectionText.toString(),
      });

      const message = {
        role: "user",
        content: prompt,
        name: `${props.username},${props.userId}`,
      };
      props.append(message as Message);
    }
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger
        disabled={selection && selection.toString().length > 0 ? false : true}
      >
        {props.children}
      </ContextMenuTrigger>
      <ContextMenuContent className={`w-64`}>
        <ContextMenuItem onClick={(e) => handleSubmit(e, "factCheck")} inset>
          Is this true?
          <ContextMenuShortcut>⇧⌘s</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem onClick={(e) => handleSubmit(e, "explain")} inset>
          Explain This
          <ContextMenuShortcut>⇧⌘S</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem onClick={(e) => handleSubmit(e, "elaborate")} inset>
          Elaborate
          <ContextMenuShortcut>⇧⌘E</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem onClick={(e) => handleSubmit(e, "criticise")} inset>
          Analyse this Critically
          <ContextMenuShortcut>⇧⌘C</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem onClick={(e) => handleSubmit(e, "examples")} inset>
          I need Examples
          <ContextMenuShortcut>⇧⌘E</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem onClick={(e) => handleSubmit(e, "references")} inset>
          I need References
          <ContextMenuShortcut>⇧⌘R</ContextMenuShortcut>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
