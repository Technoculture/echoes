import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/contextmenu";
import { useTextSelection } from "@mantine/hooks";
import { ReactNode } from "react";
// import { Dispatch, SetStateAction } from "react";

type Props = {
  // x: number;
  // y: number;
  // setShowContextMenu: Dispatch<SetStateAction<boolean>>;
  // isOpen: boolean
  children: ReactNode;
};

export function ContextWrapper(props: Props) {
  const selection = useTextSelection();

  return (
    <ContextMenu>
      <ContextMenuTrigger
        disabled={selection && selection.toString().length > 0 ? false : true}
      >
        {props.children}
      </ContextMenuTrigger>
      <ContextMenuContent className={`w-64`}>
        <ContextMenuItem inset>Is this true?</ContextMenuItem>
        <ContextMenuItem inset>Explain this</ContextMenuItem>
        <ContextMenuItem inset>Elaborate</ContextMenuItem>
        <ContextMenuItem inset>Criticise</ContextMenuItem>
        <ContextMenuItem inset>Examples</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
