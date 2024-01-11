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
// import useSlotStore from "@/store/slots";
import Search from "@/components/search";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building, User, SearchIcon } from "lucide-react";
import { useQueryState } from "next-usequerystate";
import { Button } from "@/components/button";
// import { useToast } from "@/components/ui/use-toast";
import useSearchDialogState from "@/store/searchDialogStore";

export default function LoggedInLayout({
  children, // team, // will be a page or nested layout
}: {
  children: React.ReactNode;
  // team: React.ReactNode;
}) {
  const store = useStore();
  // const slotStore = useSlotStore();
  const audioRef = useRef<HTMLAudioElement>(null);
  const pathname = usePathname();
  const { orgSlug, orgId } = useAuth();
  const [cards, setCards] = useQueryState("chats");
  const { showSearchDialog, toggleSearchDialog } = useSearchDialogState();
  // const { toast } = useToast();

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
            <div className="mt-2 grid grid-cols-3 items-center">
              <Startnewchatbutton
                org_id={orgId as string}
                org_slug={orgSlug as string}
              />
              <Tabs
                className="mx-auto"
                value={cards || "org"}
                onValueChange={(val) => {
                  console.log("onvalchange", val);
                  setCards(val);
                }}
              >
                <TabsList>
                  <TabsTrigger value="org" className="flex gap-2 items-center">
                    <Building className="h-4 w-4" />{" "}
                    <span className="hidden sm:inline">Org Chats</span>
                  </TabsTrigger>
                  <TabsTrigger value="me" className="flex gap-2 items-center">
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline">My Chats</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          }
          className="bg-primary-900 dark:backdrop-brightness-50 backdrop-blur-md"
        >
          <AudioPlayer />
          <SearchButton onClick={toggleSearchDialog}>
            <span className="hidden sm:inline">Search</span>
          </SearchButton>
          <Search orgSlug={orgSlug as string} />
        </Header>
      ) : (
        <Header
          newChild
          className="bg-primary-900 dark:backdrop-brightness-50 backdrop-blur-md"
        >
          <AudioPlayer />
          <SearchButton onClick={toggleSearchDialog}>
            <span className="hidden sm:inline">Search</span>
          </SearchButton>
          <Search orgSlug={orgSlug as string} />
        </Header>
      )}
      <div className="pl-5 pr-5 z-10 relative">{children}</div>
    </div>
  );
}

const SearchButton = (props: React.ComponentProps<typeof Button>) => {
  return (
    <Button {...props} variant="ghost" className="max-h-[32px]">
      <SearchIcon className="w-4 h-4 mr-2" />
      {props.children}
    </Button>
  );
};
