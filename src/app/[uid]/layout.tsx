import Header from "@/components/header";
import { OrganizationSwitcher, RedirectToOrganizationProfile } from "@clerk/nextjs";

export default function LoggedInLayout({
  children, // will be a page or nested layout
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Header>
        <OrganizationSwitcher />
      </Header>
      <div className="pl-5 pr-5">
        {children}
      </div>
    </>
  )
}
