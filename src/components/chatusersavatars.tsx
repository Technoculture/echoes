"use client";

import { Chat } from "@/lib/db/schema";
import { ChatLog } from "@/lib/types";
import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/avatar";
import { Button, buttonVariants } from "./button";
import { Popover } from "./popover";
import { PopoverContent, PopoverTrigger } from "@radix-ui/react-popover";

interface Props {
  chat: Chat;
}

interface UserAvatarData {
  id: string;
  img: string;
}

const Chatusersavatars = ({ chat }: Props) => {
  const [users, setUsers] = useState<Array<UserAvatarData>>(
    [] as UserAvatarData[],
  );

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
    if (chat) {
      const ids = getUserIdList(chat.messages as string);
      if (ids.length) {
        getUsers(ids);
      }
    }
  }, []);

  return (
    <div className="flex">
      {users.length > 0 ? (
        users.length === 1 ? (
          // handle first user and other seperately
          users.map((user) => (
            <Avatar className="mr-2 w-9 h-9" key={user.id}>
              <AvatarImage src={user?.img} alt="@shadcn" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          ))
        ) : (
          <div className="flex">
            {
              <Avatar className="mr-2 w-9 h-9" key={users[0]?.id}>
                <AvatarImage src={users[0]?.img} alt="@shadcn" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
            }
            <Popover>
              <PopoverTrigger>
                <Button className={buttonVariants({ variant: "secondary" })}>
                  Others
                </Button>
              </PopoverTrigger>
              <PopoverContent>
                <div className="px-2 py-1 tracking-tighter">
                  {users.slice(1).map((user) => (
                    <Avatar className=" -ml-1 w-9 h-9" key={user.id}>
                      <AvatarImage src={user?.img} alt="@shadcn" />
                      <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        )
      ) : null}
    </div>
  );
};

export default Chatusersavatars;

export const getChatCreator = (chatMessages: string): string => {
  const firstEntry = (JSON.parse(chatMessages as string) as ChatLog)?.log[0];
  const creator = firstEntry.name
    ? firstEntry.name.split(",")[0]
    : "Unknown Creator";
  return creator;
};

export const getUserIdList = (chatMessages: string): Array<string> => {
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
