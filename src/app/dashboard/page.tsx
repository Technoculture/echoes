import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs";

export default async function Page() {
  const { userId } = auth();

  if (!userId) {
    redirect("/sign-in");
  }

  redirect(`/${userId}`);
}
