"use client";
import { Button } from "@/components/button";
import DropZone from "@/components/dropzone";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ArrowLeft, PlusCircle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { PERMISSIONS } from "@/utils/constants";

interface UserNavProps {
  orgPermissions: string[];
  orgSlug: string;
  username: string;
  userId: string;
}

export function UserNav({
  username,
  userId,
  orgSlug,
  orgPermissions,
}: UserNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <Button variant="outline" className="mr-2" asChild>
        <Link
          // onClick={() => setShowLoading(true)}
          href={`/dashboard/user`}
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
      </Button>
      <DialogTrigger asChild>
        {orgPermissions.includes(PERMISSIONS.uploadFile) && (
          <Button variant="outline">
            <PlusCircle className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle> Upload a File</DialogTitle>
          <DialogDescription>
            Uploading a file allows you to add knowledge for echoes to memorise
            and use.
          </DialogDescription>
        </DialogHeader>
        <DropZone
          orgSlug={orgSlug}
          username={username}
          userId={userId}
          setIsOpen={setIsOpen}
        />
      </DialogContent>
    </Dialog>
  );
}
