import { OrganizationProfile } from "@clerk/nextjs";

export default function OrganizationProfilePage() {
  return (
    <div className="grid h-screen place-items-center">
      <OrganizationProfile routing="path" path="/organization-profile" />
    </div>
  );
}
