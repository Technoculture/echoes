import Header from "@/components/header";
import { OrganizationSwitcher, auth } from "@clerk/nextjs";

export default function LoggedInLayout({
  children, // will be a page or nested layout
}: {
  children: React.ReactNode;
}) {
  const { sessionClaims } = auth();
  return (
    <>
      <Header>
        {sessionClaims?.org_id ? (
          <div className="mr-4 h-[32px] px-2">
            <OrganizationSwitcher hidePersonal={true} />
          </div>
        ) : null}
      </Header>
      <div className="pl-5 pr-5">{children}</div>
    </>
  );
}
