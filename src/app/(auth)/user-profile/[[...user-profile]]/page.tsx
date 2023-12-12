import { UserProfile } from "@clerk/nextjs";

const UserProfilePage = () => (
  <div className="grid h-screen place-items-center m-12">
    <UserProfile path="/user-profile" routing="hash" />
  </div>
);

export default UserProfilePage;
