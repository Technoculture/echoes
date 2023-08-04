"use client";
import { useState } from "react";
import { PlusIcon } from "lucide-react";
// import Link from 'next/link';
import { buttonVariants } from "@/components/button";
import { useRouter } from "next/navigation";
import { CircleNotch } from "@phosphor-icons/react";

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
    router.push(`/${props.org_slug}/chat/${Number(data.newChatId)}`);
  };

  return (
    <button
      className={buttonVariants({ variant: "default" })}
      onClick={() => {
        setShowLoading(true);
        handleNavigate();
      }}
    >
      {showLoading ? (
        <>
          <CircleNotch className="w-4 h-4 mr-4 animate-spin" />
          Generating id
        </>
      ) : (
        <>
          <PlusIcon className="w-4 h-4 mr-4" />
          Start a new Chat
        </>
      )}
    </button>
  );
};

export default Startnewchatbutton;
