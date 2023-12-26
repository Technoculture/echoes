"use client";

import { ChatEntry } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/avatar";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { cn } from "@/lib/utils";
import { RefreshCcw } from "lucide-react";
interface Props {
  allPresenceIds: Array<string>;
  liveUserIds?: Array<string>;
  chatId: number;
  chatCreatorId: string;
  count?: number;
}

interface UserAvatarData {
  id: string;
  img: string;
}

const Chatusersavatars = ({
  chatId,
  allPresenceIds,
  liveUserIds,
  chatCreatorId,
  count = 2,
}: Props) => {
  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: [`chat-user-avatars_${chatId}`, allPresenceIds],
    queryFn: () => getUsers(allPresenceIds),
    // refetchInterval: Infinity,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    cacheTime: Infinity,
  });

  const getUsers = async (ids: Array<string>) => {
    const res = await axios.post("/api/getUsers", {
      ids: ids,
    });
    return res.data.users as UserAvatarData[];
  };

  return (
    <div>
      {isLoading ? null : isError ? (
        <div onClick={() => refetch()}>
          <RefreshCcw className="h-4 w-4" />
        </div>
      ) : (
        <div className="flex">
          {data.slice(0, count).map((user, index) => (
            <Avatar
              className={cn(
                "w-8 h-8",
                user.id === chatCreatorId ? "" : "-ml-2",
                liveUserIds && liveUserIds.includes(user.id)
                  ? "border-2 border-green-600"
                  : "border-2 border-black",
              )}
              key={user.id}
            >
              <AvatarImage src={user.img} alt="@shadcn" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          ))}
          {data.slice(count).length ? (
            <Avatar className={cn("w-8 h-8", "-ml-2")} key={"uuid"}>
              <AvatarImage src={""} alt="@shadcn" />
              <AvatarFallback>+{data.slice(count).length}</AvatarFallback>
            </Avatar>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default Chatusersavatars;

export const getUserIdList = (chatMessages: ChatEntry[]): Array<string> => {
  // const chatArray = (JSON.parse(chatMessages as string) as ChatLog)?.log;
  const ArrayContainingUsers = chatMessages.filter((chat) =>
    chat.name !== "" ? chat.name : null,
  );
  const ids = ArrayContainingUsers.map((usr) => {
    const split = usr.name?.split(",");
    return split && split.length > 0 ? split[1] : null;
  });
  const filteredIds = ids.filter((id) => id !== undefined);
  const uniqueIds = Array.from(new Set(filteredIds));
  return uniqueIds as Array<string>;
};
