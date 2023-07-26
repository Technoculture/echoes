"use client";
import { PlusIcon } from "lucide-react";
// import Link from 'next/link';
import { buttonVariants } from "@/components/button";
import { useRouter } from "next/navigation";

interface Props {
  org_slug: string;
  org_id: string;
}

const Startnewchatbutton = (props: Props) => {
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
      onClick={handleNavigate}
    >
      <PlusIcon className="w-4 h-4 mr-4" />
      Start a new Chat
    </button>
  );
};

export default Startnewchatbutton;
