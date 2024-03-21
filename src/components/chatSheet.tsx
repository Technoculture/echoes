import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "./button";
import { MessageCircle } from "lucide-react";
import { ChatEntry, ChatType } from "@/lib/types";
import Chat from "./chat";
import { useState } from "react";
// import usePreferences from "@/store/userPreferences";
import { useChannel, usePresence } from "ably/react";
import Chatusers, { getUserIdList } from "@/components/chatusersavatars";

interface Props {
  orgId: string;
  uid: string;
  dbChat: ChatEntry[];
  chatId: string;
  username: string;
  org_slug: string;
  chatTitle: string;
  imageUrl: string;
  type: ChatType;
  confidential: number | null;
}

export default function ChatSheet(props: Props) {
  const [onClickOpenChatSheet, setOnClickOpenChatSheet] =
    useState<boolean>(false);

  const { channel } = useChannel("room_5", (message) => {
    console.log(message);
  });

  const { presenceData, updateStatus } = usePresence(
    `channel_${props.chatId}`,
    {
      id: props.uid,
      username: props.username,
      isTyping: false,
    },
  );

  const dbIds = getUserIdList(props.dbChat);
  const chatCreatorId = dbIds[0];

  const liveUserIds = presenceData.map((p) => p.data.id);

  const uniqueIds = [...dbIds, ...liveUserIds].filter(
    (v, i, a) => a.indexOf(v) === i,
  );

  return (
    <div>
      <Sheet>
        <SheetTrigger asChild>
          <Button
            onClick={() => setOnClickOpenChatSheet(true)}
            variant="outline"
          >
            <MessageCircle className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent className=" w-[700px] sm:w-[540px]  overflow-x-hidden  overflow-y-scroll">
          <SheetHeader>
            <SheetTitle>
              <Chatusers
                allPresenceIds={uniqueIds}
                liveUserIds={liveUserIds}
                chatCreatorId={chatCreatorId}
                chatId={props.chatId as unknown as number}
              />
            </SheetTitle>
            <SheetFooter>
              <Chat
                onClickOpenChatSheet={onClickOpenChatSheet}
                type={props.type}
                orgId={props.orgId}
                dbChat={props.dbChat}
                chatId={props.chatId}
                uid={props.uid}
                username={props.username}
                org_slug={props.org_slug}
                chatTitle={props.chatTitle}
                imageUrl={props.imageUrl}
                confidential={props.confidential}
              />
            </SheetFooter>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    </div>
  );
}
