import { Header } from "@/components/header";
export const dynamic = "force-dynamic",
  revalidate = 0;

export default function LoggedInLayout({
  children, // will be a page or nested layout
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      <Header>
      </Header>
      <div className="pl-5 pr-5 z-10 relative">{children}</div>
    </div>
  );
}
