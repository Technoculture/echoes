import { Skeleton } from "@/components/skeleton";

export default async function Page() {
  return (
    <div className="grid grid-cols-1 gap-2">
      <div className="grid md:grid-cols-4 gap-2">
        <div className="space-y-2">
          <Skeleton className="h-4" />
          <Skeleton className="h-4 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4" />
          <Skeleton className="h-4 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4" />
          <Skeleton className="h-4 w-full" />
        </div>
      </div>
    </div>
  );
}
