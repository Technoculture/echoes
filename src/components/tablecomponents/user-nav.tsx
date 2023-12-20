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
import { PlusCircle } from "lucide-react";
import { useState } from "react";

interface UserNavProps {
  orgSlug: string;
  username: string;
  userId: string;
}

export function UserNav({ username, userId, orgSlug }: UserNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <PlusCircle className="h-4 w-4" />
        </Button>
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
