import Header from "@/components/header";

export default function LoggedInLayout({
  children, // will be a page or nested layout
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Header>
      </Header>
      <div className="pl-5 pr-5">
        {children}
      </div>
    </>
  )
}
