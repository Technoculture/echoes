"use client";
import { Header } from "@/components/header";
// export const dynamic = "force-dynamic",
// revalidate = 0;
import useStore from "@/store";

import { useRef, useEffect } from "react";
import AudioPlayer from "@/components/audioplayer";
import { usePathname } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import Startnewchatbutton from "@/components/startnewchatbutton";
import useSlotStore from "@/store/slots";
import Search from "@/components/search";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building, User } from "lucide-react";
import { useQueryState } from "next-usequerystate";
export default function LoggedInLayout({
  children,
  team, // will be a page or nested layout
}: {
  children: React.ReactNode;
  team: React.ReactNode;
}) {
  const store = useStore();
  const slotStore = useSlotStore();
  const audioRef = useRef<HTMLAudioElement>(null);
  const pathname = usePathname();
  const { orgSlug, orgId } = useAuth();
  const [cards, setCards] = useQueryState("chats");

  useEffect(() => {
    if (store.audioSrc && audioRef.current) {
      audioRef.current.src = store.audioSrc;
      audioRef.current.load();
      audioRef.current.play();
    }
    if (!store.audioSrc) {
      audioRef.current?.pause();
    }
  }, [store.audioSrc]);

  return (
    <div className="relative">
      {pathname.includes("user") ? (
        <Header
          newChild={
            <div className="grid grid-cols-3">
              <Startnewchatbutton
                org_id={orgId as string}
                org_slug={orgSlug as string}
              />
              <Tabs
                className="mx-auto"
                defaultValue="org"
                onValueChange={(val) => setCards(val)}
              >
                <TabsList>
                  <TabsTrigger value="org" className="flex gap-2 items-center">
                    <Building className="h-4 w-4" />{" "}
                    <span className="hidden sm:inline">Org Chats</span>
                  </TabsTrigger>
                  <TabsTrigger value="me" className="flex gap-2 items-center">
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline"> My Chats</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              {/* <div className="h-[32px] w-[32px]"><CustomProfile /></div> */}
            </div>
            // slotStore.slot
          }
          className="bg-black/40 backdrop-blur-md"
        >
          <AudioPlayer />
          <Search orgSlug={orgSlug as string} />
        </Header>
      ) : (
        <Header newChild className="bg-black/40 backdrop-blur-md">
          <AudioPlayer />
          <Search orgSlug={orgSlug as string} />
        </Header>
      )}
      <div className="pl-5 pr-5 z-10 relative">{children}</div>
    </div>
  );
}
