"use client";

import React from "react";
import { Chat as ChatSchema } from "@/lib/db/schema";
import { redirect } from "next/navigation";
import { useInfiniteQuery } from "@tanstack/react-query";
import Chatcard from "@/components/chatcard";
import { Button, buttonVariants } from "@/components/button";
import { useIntersection } from "@mantine/hooks";
import { CircleNotch } from "@phosphor-icons/react";
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
      queryKey: ["projects"],
      queryFn: fetchChats,
      getNextPageParam: (lastPage, pages) =>
        lastPage.length < 4 ? undefined : pages.length,
      initialData: {
        pageParams: [0],
        pages: [initialData],
      },
      enabled: false,
    });

  const lastPostRef = React.useRef<HTMLElement>(null);
  const { ref, entry } = useIntersection({
    root: lastPostRef.current,
    threshold: 1,
  });

  React.useEffect(() => {
    if (entry && entry.isIntersecting) fetchNextPage();
  }, [entry]);

  const allCards = data?.pages.flatMap((page) => page);

  return (
    <div>
      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
        {allCards?.map((chat, i) => {
          return (
            <div key={chat.id} ref={allCards.length - 1 === i ? ref : null}>
              <Chatcard
                priority={i < 4}
                chat={chat}
                org_id={org_id}
                uid={uid}
                org_slug={org_slug as string}
              />
            </div>
          );
        })}
      </div>
      <Button
        disabled={isFetchingNextPage || !hasNextPage}
        className={`${buttonVariants({ variant: "secondary" })} mt-4 `}
      >
        <CircleNotch
          className={` mr-2 ${isFetchingNextPage ? "animate-spin" : "hidden"}`}
          size={24}
          color="#618a9e"
          weight="bold"
        />
        {!hasNextPage ? "No More Chats" : "  Loading"}
      </Button>
    </div>
  );
};

export default ChatCardWrapper;
