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
import Chatusers from "@/components/chatusersavatars";
import { CircleNotch } from "@phosphor-icons/react";
import { ChatLog } from "@/lib/types";
import Image from "next/image";

type Props = {
  chat: Chat;
  uid: string;
  org_id: string | undefined;
  org_slug: string;
};

const Chatcard = ({ chat, uid, org_id, org_slug }: Props) => {
  const [showLoading, setShowLoading] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [imageUrl, setImageUrl] = useState(chat.image_url);
  const generateTitle = async () => {
    const res = await fetch(`/api/generateTitle/${chat.id}/${org_id}`, {
      method: "POST",
    });
  };
  const generateImage = async (chatTitle: string) => {
    setIsGeneratingImage(() => true);
    const res = await fetch(`/api/generateImage/${chat.id}/${org_id}`, {
      method: "POST",
      body: JSON.stringify({ chatTitle: chatTitle }),
    });
    const data = await res.json();
    setImageUrl(data.url);
    console.log("this is image url", data.url);
    setIsGeneratingImage(() => false);
  };

  // generate Avatar's of all the users
  // filter all the distinct users from the chat.messages.log => will get all the user's id
  // have to get the user's list and then again filter the users of particular Chat
  // then from the imgUrl on the user object generate the image
  let title = "";
  let description = "";
  if (chat.title) {
    const trimmed = chat.title?.replace('"', "").replace('"', "");
    title = trimmed.split(":")[0];
    description = trimmed.split(":")[1];
  }
  console.log("url", chat.image_url);
  const msg = chat.messages;
  const chatlog = JSON.parse(msg as string) as ChatLog;
  const firstMessage = chatlog.log[0].content;
  const chatTitle = chat.title || firstMessage;

  return (
    <div className="relative">
      <Card className="relative overflow-hidden hover:backdrop-blur-sm ">
        <CardHeader className="h-36 overflow-y-hidden overflow-hidden">
          {/* <div className=" absolute opacity-100 "> */}
          <CardTitle className="">{title}</CardTitle>
          <CardDescription className="text-foreground">
            {description === "" ? (
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
          <Chatusers chat={chat} />
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
