"use client";
import { Chat } from "@/lib/db/schema";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import React, { useEffect, useState } from "react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/avatar";

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

  const [users, setUsers] = useState([] as { id: string; img: string }[]);

  useEffect(() => {
    const getUsers = async (ids: Array<string>) => {
      const users = await fetch("/api/getUsers", {
        method: "POST",
        body: JSON.stringify({ ids: ids }),
      });
      const data = await users.json();
      console.log("data", data);
      setUsers(data.users);
    };

    const ids = getUserIdList(chat.messages as string);
    if (ids.length) {
      getUsers(ids);
    }
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Chat ID: {chat.id}</CardTitle>
        <CardDescription>
          This chat was initiated By{" "}
          <b>{getChatCreator(chat.messages as string)}</b>
        </CardDescription>
      </CardHeader>
      <CardContent className="">
        <p className="h-24 overflow-y-hidden">
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
        </p>
        <div className="flex ">
          {users.length > 0
            ? users.map((user) => (
                <Avatar className="mr-2 w-9 h-9" key={user.id}>
                  <AvatarImage src={user?.img} alt="@shadcn" />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
              ))
            : "No Data Saved"}
        </div>
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

const getChatCreator = (chatMessages: string): string => {
  const firstEntry = (JSON.parse(chatMessages as string) as ChatLog)?.log[0];
  const creator = firstEntry.name
    ? firstEntry.name.split(",")[0]
    : "Unknown Creator";
  return creator;
};

const getUserIdList = (chatMessages: string): Array<string> => {
  const chatArray = (JSON.parse(chatMessages as string) as ChatLog)?.log;
  const ArrayContainingUsers = chatArray.filter((chat) =>
    chat.name !== "" ? chat.name : null,
  );
  const ids = ArrayContainingUsers.map((usr) => {
    const split = usr.name.split(",");
    return split.length > 0 ? split[1] : null;
  });
  const filteredIds = ids.filter((id) => id !== undefined);
  console.log("ArrayContainingUsers", filteredIds);
  return filteredIds as Array<string>;
};
