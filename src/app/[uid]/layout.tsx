import Header from "@/components/header";
import { Button } from "@/components/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function LoggedInLayout({
  children, // will be a page or nested layout
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Header>
      </Header>
      <div className="pl-4 pr-4">
        {children}
      </div>
    </>
  )
}
