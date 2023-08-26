"use client";
import { useState } from "react";
import { Chat } from "@/lib/db/schema";
import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react";
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

type Props = {
  chat: Chat;
  uid: string;
  org_id: string | undefined;
  org_slug: string;
};

const Chatcard = ({ chat, uid, org_id, org_slug }: Props) => {
  const [showLoading, setShowLoading] = useState(false);
  const generateTitle = async () => {
    const res = await fetch(`/api/generateTitle/${chat.id}/${org_id}`, {
      method: "POST",
    });
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

  return (
    <Card>
      <CardHeader className="h-36 overflow-y-hidden">
        <CardTitle className="">{title}</CardTitle>
        <CardDescription>
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
      </CardHeader>
      <CardContent className="flex justify-between">
        <Chatusers chat={chat} />
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
      </CardContent>
    </Card>
  );
};

export default Chatcard;
