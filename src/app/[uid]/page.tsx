import { buttonVariants } from "@/components/button";
import Link from "next/link";

export default function Page({ params }: { params: { uid: string } }) {
  const { uid } = params;

  return (
    <div>
      <h1 className="">My Page</h1>
      <Link href={ `${uid}/new`} className={buttonVariants({ variant: "secondary" })}>Chat</Link>
    </div>
  );
}
