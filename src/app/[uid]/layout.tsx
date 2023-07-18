import Header from "@/components/header";
import { OrganizationSwitcher, auth } from "@clerk/nextjs";
export const dynamic = "force-dynamic",
  revalidate = 0;

export default function LoggedInLayout({
  children, // will be a page or nested layout
}: {
  children: React.ReactNode;
}) {
  const { sessionClaims } = auth();
  const orgs: Object = sessionClaims?.organizations as Object;

  return (
    <>
      <Header>
        {Object.keys(orgs).length !== 0 ? (
          <div className="mr-4 h-[32px] px-2">
            <OrganizationSwitcher hidePersonal={true} />
          </div>
        ) : null}
      </Header>
      <div className="pl-5 pr-5">{children}</div>
    </>
  );
}
