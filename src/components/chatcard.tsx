"use client";
import { useState } from "react";
import { Chat } from "@/lib/db/schema";
import Link from "next/link";
import { ArrowRight, Image as Image2 } from "@phosphor-icons/react";
import { buttonVariants } from "@/components/button";
import {
  Card,
  CardHeader,
  CardDescription,
  CardContent,
  CardTitle,
} from "@/components/card";
import Chatusers, { getUserIdList } from "@/components/chatusersavatars";
import { CircleNotch } from "@phosphor-icons/react";
import { ChatEntry, ChatLog } from "@/lib/types";
import Image from "next/image";
import AudioButton from "@/components//audioButton";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

type Props = {
  chat: Chat;
  uid: string;
  org_id: string;
  org_slug: string;
};

const Chatcard = ({ chat, uid, org_id, org_slug }: Props) => {
  const queryClient = useQueryClient();
  const [showLoading, setShowLoading] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [imageUrl, setImageUrl] = useState(chat.image_url);
  const generateTitle = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    e.stopPropagation();
    const chatlog = JSON.parse(chat.messages as string) as ChatLog;
    console.log("chatlog", chatlog.log);
    const msgs = chatlog.log as ChatEntry[];
    console.log("messages", msgs);
    const chats = msgs.slice(0, 2);
    const res = await fetch(`/api/generateTitle/${chat.id}/${org_id}`, {
      method: "POST",
      body: JSON.stringify({ chat: chats }),
    });
    const data = await res.json();
    await queryClient.invalidateQueries({
      queryKey: ["projects"],
      exact: true,
      refetchType: "all",
    });
    setTitle(data.title.replace('"', "").replace('"', "").split(":")[0]);
    setDescription(data.title.replace('"', "").replace('"', "").split(":")[1]);
  };
  const generateImage = async (chatTitle: string) => {
    setIsGeneratingImage(() => true);
    const res = await fetch(`/api/generateImage/${chat.id}/${org_id}`, {
      method: "POST",
      body: JSON.stringify({ chatTitle: chatTitle }),
    });
    const data = await res.json();
    setImageUrl(data.url);
    setIsGeneratingImage(() => false);
  };
  const router = useRouter();

  // generate Avatar's of all the users
  // filter all the distinct users from the chat.messages.log => will get all the user's id
  // have to get the user's list and then again filter the users of particular Chat
  // then from the imgUrl on the user object generate the image
  const [title, setTitle] = useState(() => {
    if (chat.title) {
      const trimmed = chat.title?.replace('"', "").replace('"', "");
      let t = trimmed.split(":")[0];
      return t ? t : "";
    } else {
      return "";
    }
  });
  const [description, setDescription] = useState(() => {
    if (chat.title) {
      const trimmed = chat.title?.replace('"', "").replace('"', "");
      let d = trimmed.split(":")[1];
      return d ? d : "";
    } else {
      return "";
    }
  });
  const msg = chat.messages;
  const chatlog = JSON.parse(msg as string) as ChatLog;
  const firstMessage = chatlog.log[0].content;
  const chatTitle = chat.title || firstMessage;

  // extracts chatentry from chatlog
  const chats = JSON.parse(chat.messages as string) as ChatLog;
  const userIds = getUserIdList(chats.log);

  return (
    <div
      className="relative cursor-pointer"
      onClick={() => {
        setShowLoading(true);
        router.push(`${org_slug}/chat/${chat.id}`);
      }}
    >
      <Card className="relative overflow-hidden hover:backdrop-blur-sm ">
        <CardHeader className="h-36 overflow-y-hidden overflow-hidden">
          {/* <div className=" absolute opacity-100 "> */}
          <CardTitle className="">
            {title}{" "}
            <AudioButton
              chatId={String(chat.id)} // id to recognise chat
              chatTitle={title}
              description={description}
              id={String(chat.id)} // id for the track
              imageUrl={chat.image_url}
              messages={chatlog.log}
              summarize={true}
              orgId={org_id}
              audio={chat.audio}
              variant="ghost"
              size="sm"
              className="text-xs"
            />
          </CardTitle>
          <CardDescription className="text-foreground">
            {title === "" ? (
              <span>
                No title{" "}
                <button
                  className={buttonVariants({ variant: "outline" })}
                  onClick={generateTitle}
                >
                  Generate
                </button>{" "}
              </span>
            ) : (
              <>{description}</>
            )}
          </CardDescription>
          {/* </div> */}
        </CardHeader>
        <CardContent className="flex justify-between ">
          <Chatusers
            allPresenceIds={userIds}
            chatId={chat.id}
            chatCreatorId={userIds[0]}
          />
          <div className="flex gap-2">
            {!imageUrl && (
              <span>
                <button
                  className={buttonVariants({ variant: "outline" })}
                  onClick={() => generateImage(chatTitle)}
                >
                  {isGeneratingImage ? (
                    <CircleNotch className="m-1 w-4 h-4 animate-spin" />
                  ) : (
                    <Image2 className="w-4 h-4" />
                  )}
                </button>{" "}
              </span>
            )}
            <Link
              onClick={() => setShowLoading(true)}
              href={{
                pathname: `${org_slug}/chat/${chat.id}`,
              }}
              key={chat.id}
              className={buttonVariants({ variant: "secondary" })}
            >
              {showLoading ? (
                <CircleNotch className="m-1 w-4 h-4 animate-spin" />
              ) : (
                <ArrowRight className=" m-1 w-4 h-4" />
              )}
            </Link>
          </div>
        </CardContent>
      </Card>
      {imageUrl && (
        <Image
          src={imageUrl}
          alt="Photo by Drew Beamer"
          fill
          className="absolute rounded-md object-cover bg-cover mix-blend-lighten brightness-50 hover:blur-sm pointer-events-none "
        />
      )}
    </div>
  );
};

export default Chatcard;
