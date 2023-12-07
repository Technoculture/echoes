"use client";

import React from "react";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/avatar";
import { ChatRole } from "@/lib/types";
import { Loader2 } from "lucide-react";

type Props = {
  userData?: string;
  role: ChatRole;
};

const UserAvatar = (props: Props) => {
  const queryClient = useQueryClient();

  const [name, id] = props.userData ? props.userData.split(",") : ["Echoe", ""];

  const { data, isLoading, isError } = useQuery({
    queryKey: ["useravatar", id],
    queryFn: async () => {
      const res = await fetch(`/api/getUsers`, {
        method: "POST",
        body: JSON.stringify({ ids: [id] }),
      });
      const data = await res.json();
      return data;
    },
    enabled: !!props.userData,
  });

  return (
    <div>
      {props.role === "assistant" ? (
        <Avatar>
          <AvatarImage src={"/apple-touch-icon.png"} alt="echo" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
      ) : isLoading ? (
        <Loader2 className="relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full animate-spin" />
      ) : isError ? (
        <div>error</div>
      ) : (
        <Avatar>
          <AvatarImage src={data?.users[0]?.img || null} alt={name} />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
      )}
    </div>
  );
};

export default UserAvatar;
