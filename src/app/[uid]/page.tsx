import { buttonVariants } from "@/components/button";
import Link from "next/link";

export default function Page({ params }: { params: { slug: string } }) {
  console.log(params);

  return (
    <div>
      <h1>My Page</h1>
      <Link href={ `${params.slug}/chat`} className={buttonVariants({ variant: "secondary" })}>Chat</Link>
    </div>
  );
}
