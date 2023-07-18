"use client";
import { Chat } from "@/lib/db/schema";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "./button";
import {
  Card,
  CardHeader,
  CardDescription,
  CardContent,
  CardTitle,
} from "./card";
import Chatusers from "@/components/chatusersavatars";

type Props = {
  chat: Chat;
  uid: string;
  org_id: string | undefined;
  org_slug: string;
};

const Chatcard = ({ chat, uid, org_id, org_slug }: Props) => {
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
        <CardTitle className="h-20 overflow-y-hidden">{title}</CardTitle>
        <CardDescription>
          {description === "" ? (
            <p>
              No title{" "}
              <button
                className={buttonVariants({ variant: "outline" })}
                onClick={generateTitle}
              >
                Generate
              </button>{" "}
            </p>
          ) : (
            <>{description}</>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex justify-between">
        <Chatusers chat={chat} />
        <Link
          href={{
            pathname: `${org_slug}/chat/${chat.id}`,
          }}
          key={chat.id}
          className={buttonVariants({ variant: "secondary" })}
        >
          <ArrowRight className=" m-1 w-4 h-4" />
        </Link>
      </CardContent>
    </Card>
  );
};

export default Chatcard;
