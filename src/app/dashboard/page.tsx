import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs";

export default async function Page() {
  const user = await currentUser();
  redirect(`/${user?.username}`);
}
