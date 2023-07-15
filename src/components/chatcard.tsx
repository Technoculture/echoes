"use client";
import { Chat } from "@/lib/db/schema";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import React from "react";
import { buttonVariants } from "./button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "./card";
import { ChatLog } from "@/lib/types";

type Props = {
  chat: Chat;
  uid: string;
  org_id: string | undefined;
};

const Chatcard = ({ chat, uid, org_id }: Props) => {
  const generateTitle = async () => {
    const res = await fetch(`/api/generateTitle/${chat.id}/${org_id}`, {
      method: "POST",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Chat ID: {chat.id}</CardTitle>
        <CardDescription>
          This chat was initiated By{" "}
          <b>{getChatCreator(chat.messages as string)}</b>
        </CardDescription>
      </CardHeader>
      <CardContent>
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
          chat.title
        )}
      </CardContent>
      <CardFooter className="w-full">
        <Link
          href={{
            pathname: `${uid}/chat/${chat.id}`,
            query: {
              orgId: String(org_id),
            },
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

const getChatCreator = (chatMessages: string): string => {
  const firstEntry = (JSON.parse(chatMessages as string) as ChatLog)?.log[0];
  const creator = firstEntry.name
    ? firstEntry.name.split(",")[0]
    : "Unknown Creator";
  return creator;
};
