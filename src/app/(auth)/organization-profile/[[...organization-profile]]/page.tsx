import { OrganizationProfile } from "@clerk/nextjs";

export default function OrganizationProfilePage() {
  return (
    <div className="grid h-screen place-items-center m-12">
      <OrganizationProfile routing="path" path="/organization-profile" />
    </div>
  );
}
