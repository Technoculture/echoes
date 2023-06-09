import { buttonVariants } from "@/components/button";
import Link from "next/link";
import { redirect } from "next/navigation";
import { currentUser } from '@clerk/nextjs';

export default async function Page({ params }: { params: { uid: string } }) {
  const { uid } = params;
  const user = await currentUser();
  // console.log(user?.username, uid);
  if (!user || !uid || user?.username !== uid) {
    redirect("/");
  }

  return (
    <div className="flex-col gap-2">
      <Link href={`${uid}/chat/new`} className={buttonVariants({ variant: "secondary" })}>
        Start a new Chat
      </Link>
    </div>
  );
}
