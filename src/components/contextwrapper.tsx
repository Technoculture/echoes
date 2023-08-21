import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/contextmenu";
import { useTextSelection } from "@mantine/hooks";
import { ChatRequestOptions, CreateMessage, Message } from "ai";
import { ReactNode } from "react";

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
  const selection = useTextSelection();

  const handleSubmit = async (e: any, promptType: PromptTypes) => {
    if (selection && selection.toString().length > 0) {
      let template = PromptTemplate.fromTemplate(`{prompt}"{selection}"`);
      let prompt = await template.format({
        prompt: predefinedPrompts[promptType],
        selection: selection.toString(),
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
        </ContextMenuItem>
        <ContextMenuItem onClick={(e) => handleSubmit(e, "explain")} inset>
          Explain this
        </ContextMenuItem>
        <ContextMenuItem onClick={(e) => handleSubmit(e, "elaborate")} inset>
          Elaborate
        </ContextMenuItem>
        <ContextMenuItem onClick={(e) => handleSubmit(e, "criticise")} inset>
          Criticise
        </ContextMenuItem>
        <ContextMenuItem onClick={(e) => handleSubmit(e, "examples")} inset>
          Examples
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
