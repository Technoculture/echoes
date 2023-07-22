"use client";

import { ReactNode } from "react";
import { RoomProvider } from "@/../../liveblocks.config";
import { LiveList } from "@liveblocks/client";
import { ClientSideSuspense } from "@liveblocks/react";
import { ChatEntry } from "@/lib/types";
// import { useParams } from "next/navigation";
// import { useUser } from "@clerk/nextjs";

export default function Room({
  children,
  roomId,
  initialData,
  uid,
}: {
  children: ReactNode;
  roomId: string;
  uid: string;
  initialData: ChatEntry[];
}) {
  // const params = useParams();

  // const {isLoaded, user, isSignedIn} = useUser();

  // console.log("useParams", params.chatid)

  return (
    <RoomProvider
      id={`room_${roomId}`}
      initialPresence={{
        id: uid,
      }}
      initialStorage={{
        chat: new LiveList(initialData),
        // ✅ This is a client component, so everything works!
        // session: new LiveObject(),
      }}
    >
      <ClientSideSuspense fallback={<div>Loading…</div>}>
        {() => <>{children}</>}
      </ClientSideSuspense>
    </RoomProvider>
  );
}
