"use client";
import { Header } from "@/components/header";
// export const dynamic = "force-dynamic",
// revalidate = 0;
import useStore from "@/store";

import { useRef, useEffect } from "react";
import AudioPlayer from "@/components/audioplayer";

export default function LoggedInLayout({
  children, // will be a page or nested layout
}: {
  children: React.ReactNode;
}) {
  const store = useStore();
  const audioRef = useRef<HTMLAudioElement>(null);

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
  console.log("from nested layout");

  return (
    <div className="relative">
      <Header className="bg-black/40 backdrop-blur-md">
        <AudioPlayer />
      </Header>
      <div className="pl-5 pr-5 z-10 relative">{children}</div>
    </div>
  );
}
