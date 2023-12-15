import { UserProfile } from "@clerk/nextjs";

const UserProfilePage = () => (
  <div className="grid h-screen place-items-center">
    <UserProfile path="/user-profile" routing="hash" />
  </div>
);

export default UserProfilePage;
