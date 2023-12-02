"use client";
import { Header } from "@/components/header";
// export const dynamic = "force-dynamic",
// revalidate = 0;
import useStore from "@/store";

import { useRef, useEffect } from "react";
import AudioPlayer from "@/components/audioplayer";
import { usePathname } from "next/navigation";
import { OrganizationSwitcher, useAuth } from "@clerk/nextjs";
import Startnewchatbutton from "@/components/startnewchatbutton";
import useSlotStore from "@/store/slots";
import Search from "@/components/search";

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

  console.log("orgSlug", orgSlug);

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
      {pathname.includes("user_") ? (
        <Header
          newChild={
            <div className=" flex justify-between">
              <Startnewchatbutton
                org_id={orgId as string}
                org_slug={orgSlug as string}
              />
              <div className="h-[32px]">
                <OrganizationSwitcher hidePersonal={true} />
              </div>
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
