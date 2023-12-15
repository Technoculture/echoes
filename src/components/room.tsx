"use client";
import React, { useState } from "react";
import { ChatEntry, ChatType } from "@/lib/types";
import { Chat as ChatSchema } from "@/lib/db/schema";

import { Button } from "@/components/button";
import Link from "next/link";
import Chatusers, { getUserIdList } from "@/components/chatusersavatars";
import Chat from "@/components/chat";
import { CircleNotch, ArrowLeft } from "@phosphor-icons/react";
import { Eye, EyeOff } from "lucide-react";
import usePreferences from "@/store/userPreferences";
import { useChannel, usePresence } from "ably/react";

interface Props {
  orgId: string;
  uid: string;
  chat: ChatEntry[];
  chatId: string;
  username: string;
  chatAvatarData: ChatSchema;
  org_slug: string;
  chatTitle: string;
  imageUrl: string;
  type: ChatType;
}

const RoomWrapper = (props: Props) => {
  const [showLoading, setShowLoading] = useState(false);
  const { channel } = useChannel("room_5", (message) => {
    console.log(message);
  });

  const preferences = usePreferences();
  const { presenceData, updateStatus } = usePresence(
    `channel_${props.chatId}`,
    {
      id: props.uid,
      username: props.username,
      isTyping: false,
    },
  );

  const dbIds = getUserIdList(props.chat);
  const chatCreatorId = dbIds[0];

  const liveUserIds = presenceData.map((p) => p.data.id);

  const uniqueIds = [...dbIds, ...liveUserIds].filter(
    (v, i, a) => a.indexOf(v) === i,
  );

  return (
    <>
      <div className="flex flex-col flex-grow min-h-[calc(100dvh-100px)] justify-between h-full mt-[80px]">
        <div className="flex space-between mb-2">
          <div className="flex items-center">
            <Button variant="outline" className="mr-2" asChild>
              <Link
                onClick={() => setShowLoading(true)}
                href={`/dashboard/user`}
              >
                {showLoading ? (
                  <CircleNotch className="w-4 h-4 animate-spin" />
                ) : (
                  <ArrowLeft className="h-4 w-4" />
                )}
              </Link>
            </Button>

            <Chatusers
              allPresenceIds={uniqueIds}
              liveUserIds={liveUserIds}
              chatCreatorId={chatCreatorId}
              chatId={props.chatId as unknown as number}
            />
          </div>

          <div className="grow" />
          <Button
            onClick={() => preferences.toggleShowSubRoll()}
            variant="outline"
          >
            {preferences.showSubRoll ? (
              <Eye className="h-4 w-4" />
            ) : (
              <EyeOff className="h-4 w-4" />
            )}
          </Button>
        </div>
        <Chat
          type={props.type}
          orgId={props.orgId}
          dbChat={props.chat}
          chatId={props.chatId}
          uid={props.uid}
          username={props.username}
          org_slug={props.org_slug}
          chatTitle={props.chatTitle}
          imageUrl={props.imageUrl}
        />
      </div>
    </>
  );
};

export default RoomWrapper;
