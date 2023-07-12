import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs";

export default async function Page() {
  const { sessionClaims } = auth();
  console.log(sessionClaims?.sub);
  redirect(`/${sessionClaims?.sub}`);
}
