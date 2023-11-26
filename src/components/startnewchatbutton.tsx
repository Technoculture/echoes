"use client";

import { useState } from "react";
import { buttonVariants } from "@/components/button";
import { useRouter } from "next/navigation";
import { Plus, CircleNotch } from "@phosphor-icons/react";

interface Props {
  org_slug: string;
  org_id: string;
}

const Startnewchatbutton = (props: Props) => {
  const [showLoading, setShowLoading] = useState(false);
  const router = useRouter();
  const handleNavigate = async () => {
    const res = await fetch(`/api/generateNewChatId/${props.org_id}`, {
      method: "POST",
    });
    const data = await res.json();
    router.push(`/usr/${props.org_slug}/chat/${Number(data.newChatId)}`);
  };

  return (
    <button
      className={buttonVariants({ variant: "outline" })}
      onClick={() => {
        setShowLoading(true);
        handleNavigate();
      }}
    >
      {showLoading ? (
        <>
          <CircleNotch className="w-4 h-4 mr-2 animate-spin" />
          Starting New Chat
        </>
      ) : (
        <>
          <Plus className="w-4 h-4 mr-2" />
          New Chat
        </>
      )}
    </button>
  );
};

export default Startnewchatbutton;
