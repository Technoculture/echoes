"use client";
import { Header } from "@/components/header";
export const dynamic = "force-dynamic",
  revalidate = 0;
import useStore from "@/store";

export default function LoggedInLayout({
  children, // will be a page or nested layout
}: {
  children: React.ReactNode;
}) {
  const store = useStore();
  return (
    <div className="relative">
      <Header>
        <audio
          src={store.audioSrc}
          controls
          controlsList="nodownload noplaybackrate"
          className="ml-2 px-1 h-4"
        ></audio>
      </Header>
      <div className="pl-5 pr-5 z-10 relative">{children}</div>
    </div>
  );
}
