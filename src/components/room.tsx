"use client";
import React, { useState } from "react";
import { useMyPresence, useOthers, useStorage } from "../../liveblocks.config";
import { ChatEntry, ChatLog } from "@/lib/types";
import { Chat as ChatSchema } from "@/lib/db/schema";

import { Button } from "@/components/button";
import Link from "next/link";
import Chatusers from "@/components/chatusersavatars";
import Chat from "@/components/chat";
import { CircleNotch, ArrowLeft } from "@phosphor-icons/react";

interface Props {
  orgId: string;
  uid: string;
  chat: ChatLog;
  chatId: string;
  username: string;
  chatAvatarData: ChatSchema;
  org_slug: string;
}

const RoomWrapper = (props: Props) => {
  const [showLoading, setShowLoading] = useState(false);
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
  return (
    <>
      <div className="flex flex-col flex-grow min-h-[calc(100dvh-72px)] justify-between h-full">
        <div className="flex space-between mb-2">
          <div className="flex items-center">
            <Button variant="outline" className="mr-2" asChild>
              <Link
                onClick={() => setShowLoading(true)}
                href={`/usr/${props.uid}`}
              >
                {showLoading ? (
                  <CircleNotch className="w-4 h-4 animate-spin" />
                ) : (
                  <ArrowLeft className="h-4 w-4" />
                )}
              </Link>
            </Button>

            <Chatusers
              allPresenceIds={liveUsersIds}
              chatLive={
                incomingChatData !== null
                  ? (incomingChatData as ChatEntry[])
                  : props.chat.log
              }
            />
          </div>

          <div className="grow" />
        </div>
        <Chat
          orgId={props.orgId}
          dbChat={props.chat}
          liveChat={incomingChatData}
          chatId={props.chatId}
          uid={props.uid}
          username={props.username}
          org_slug={props.org_slug}
        />
      </div>
    </>
  );
};

export default RoomWrapper;
