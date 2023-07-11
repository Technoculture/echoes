import { Button } from "@/components/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/skeleton";

function Loading() {
  return (
    <>
      <div className="space-y-2">
        <Skeleton className="h-4" />
        <Skeleton className="h-4 w-full" />
      </div>
    </>
  );
}

export default async function Page() {
  return (
    <div className="flex-col h-full justify-between">
      <div className="flex space-between mb-2">
        <Button variant="outline" asChild>
          <Link href={`/dashboard`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="grow" />
      </div>
      <div className="grid gap-2 mt-6">
        <Loading />
      </div>
    </div>
  );
}
