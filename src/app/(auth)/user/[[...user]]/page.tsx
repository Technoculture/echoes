import { UserProfile } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="grid h-screen place-items-center m-12">
      <UserProfile path="/user" routing="path" />
    </div>
  );
}
