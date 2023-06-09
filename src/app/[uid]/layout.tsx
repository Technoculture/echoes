import Header from "@/components/header";

export default function LoggedInLayout({
  children, // will be a page or nested layout
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Header />
      <div className="pl-4 pr-4">
        {children}
      </div>
    </>
  )
}
