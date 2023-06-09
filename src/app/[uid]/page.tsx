import { buttonVariants } from "@/components/button";
import Link from "next/link";

export default function Page({ params }: { params: { uid: string } }) {
  const { uid } = params;

  return (
    <div className="flex-col gap-2">
      <Link href={`${uid}/new`} className={buttonVariants({ variant: "secondary" })}>Start a new Chat</Link>
    </div>
  );
}
