import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs";

export default async function Page() {
  const user = await currentUser();
  const userId = user?.id;

  redirect(`/${userId}`);
}
