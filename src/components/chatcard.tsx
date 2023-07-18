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
  CardFooter,
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

  return (
    <Card>
      <CardHeader>
        <CardDescription>
          {chat.title === "" ? (
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
            <>{chat.title?.replace('"', "")}</>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="">
        <Chatusers chat={chat} />
      </CardContent>
      <CardFooter className="w-full">
        <Link
          href={{
            pathname: `${org_slug}/chat/${chat.id}`,
            // query: {
            //   orgId: String(org_id),
            // },
          }}
          key={chat.id}
          className={buttonVariants({ variant: "secondary" })}
        >
          {/* {chat.id}(
                        {(JSON.parse(chat.messages as string) as ChatLog)?.log
                          .length || 0}
                        ) */}
          Enter <ArrowRight className=" ml-2 w-4 h-4 mr-10" />
        </Link>
      </CardFooter>
    </Card>
  );
};

export default Chatcard;
