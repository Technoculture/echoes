"use client";
import React from "react";
import { useMyPresence, useOthers, useStorage } from "../../liveblocks.config";
import { ChatEntry, ChatLog } from "@/lib/types";
import { Chat as ChatSchema } from "@/lib/db/schema";

import { Button } from "@/components/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import Chatusers from "@/components/chatusersavatars";
import Chat from "@/components/chat";

interface Props {
  orgId: string;
  uid: string;
  chat: ChatLog;
  chatId: string;
  username: string;
  chatAvatarData: ChatSchema;
}

const RoomWrapper = (props: Props) => {
  const others = useOthers();
  const me = useMyPresence();

  // getting the ids of all the active (presence) users
  const userWithIds = others.filter((o) => o.presence.id !== null);
  const liveUsersIds: Array<string> = userWithIds.map(
    (o) => o.presence.id,
  ) as Array<string>;
  // adding myself to the active users list
  liveUsersIds.push(me[0].id as string);

  const incomingChatData = useStorage((root) => root.chat);

  console.log("this is initialized data", incomingChatData);
  // console.log("others", others)
  // useEffect(() => {
  const userCount = others.length;
  console.log("this is count of live Users", others, userCount);
  // }, [others])

  return (
    <>
      <div className="flex-col h-full justify-between">
        <div className="flex space-between mb-2">
          <div className="flex items-center">
            <Button variant="outline" className="mr-2" asChild>
              <Link href={`/${props.uid}`}>
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>

            {/* <Chatusers allPresenceIds={ids2} chat={props.chatAvatarData} /> */}
            <Chatusers
              allPresenceIds={liveUsersIds}
              chatLive={
                incomingChatData !== null
                  ? (incomingChatData as ChatEntry[])
                  : props.chat.log
              }
            />
            {/* <Button variant="outline" className="mr-2">
            <PlusIcon className="h-4 w-4" />
          </Button> */}
          </div>

          <div className="grow" />
        </div>
        <div></div>
        <Chat
          orgId={props.orgId}
          dbChat={props.chat}
          liveChat={incomingChatData}
          chatId={props.chatId}
          uid={props.uid}
          username={props.username}
        />
      </div>
    </>
  );
};

export default RoomWrapper;
