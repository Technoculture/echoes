"use client";

import React from "react";
import { Chat as ChatSchema } from "@/lib/db/schema";
import { redirect } from "next/navigation";
import { useInfiniteQuery } from "@tanstack/react-query";
import Chatcard from "./chatcard";
import { Button, buttonVariants } from "./button";

interface Props {
  org_id: string | undefined;
  org_slug: string; // handle case of undefined in future
  uid: string;
  // initial conversation data
  initialData: ChatSchema[];
}

// here will get all the conversation, will make them paginated and generate card for them
const ChatCardWrapper = ({ org_id, org_slug, uid, initialData }: Props) => {
  if (org_id === undefined) {
    redirect(`${uid}`);
  }

  const fetchChats = async ({ pageParam = 0 }) => {
    console.log("pageParam", pageParam);
    const response = await fetch(
      `/api/getPaginatedChats/${org_id}?page=${pageParam}`,
      {
        method: "GET",
      },
    );
    const chats = await response.json();
    console.log(chats);
    return chats.conversations;
  };

  const { data, fetchNextPage, isFetchingNextPage, hasNextPage } =
    useInfiniteQuery({
      queryKey: ["projects", initialData],
      queryFn: fetchChats,
      getNextPageParam: (lastPage, pages) =>
        lastPage.length < 4 ? undefined : pages.length,
      initialData: {
        pageParams: [0],
        pages: [initialData],
      },
      enabled: false,
    });

  return (
    <div>
      <div className="grid md:grid-cols-4 gap-2 mt-4">
        {data?.pages.flat().map((chat) => {
          return (
            <Chatcard
              chat={chat}
              org_id={org_id}
              uid={uid}
              key={chat.id}
              org_slug={org_slug as string}
            />
          );
        })}
      </div>
      <Button
        disabled={isFetchingNextPage || !hasNextPage}
        onClick={() => fetchNextPage()}
        className={`${buttonVariants({ variant: "secondary" })} mt-4`}
      >
        {hasNextPage ? "Load More" : "No More Chats"}
      </Button>
    </div>
  );
};

export default ChatCardWrapper;
