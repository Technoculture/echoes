"use client";

import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { Row } from "@tanstack/react-table";

import { Button } from "@/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdownmeu";

import { Task, taskSchema } from "../../assets/data/schema";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Checkbox } from "../ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useAuth } from "@clerk/nextjs";

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
}

const documentTypes = ["patent", "paper", "documentation", "report"];
const documentEnum = z.enum(["patent", "paper", "documentation", "report"]);
const fileFormSchema = z.object({
  isConfidential: z.boolean(),
  isInternal: z.boolean(),
  type: z.enum(["patent", "paper", "documentation", "report"]),
});

export function DataTableRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  console.log("oroginal row", row.original);
  const task = taskSchema.parse(row.original);
  const taskType = documentEnum.parse(task.type);
  const [isSaving, setIsSaving] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { orgSlug } = useAuth();

  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof fileFormSchema>>({
    resolver: zodResolver(fileFormSchema),
    defaultValues: {
      isConfidential: task.label === "confidential" ? true : false,
      isInternal: task.label === "internal" ? true : false,
      type: taskType,
    },
  });

  const onSubmit = async (data: z.infer<typeof fileFormSchema>) => {
    console.log(data);
    setIsSaving(true);

    try {
      const res = await axios.patch("/api/updateFileMetadata", {
        fileName: task.title,
        orgSlug: orgSlug,
        metadata: {
          id: task.id,
          "file-name": task.title,
          "added-by": task.addedBy,
          "added-on": task.addedOn,
          confidentiality: data.isConfidential
            ? "confidential"
            : "non-confidential",
          "access-level": data.isInternal ? "internal" : "external",
          "file-type": data.type,
        },
      });
      setIsSaving(false);
      setIsOpen(false);
      queryClient.invalidateQueries(["files"]);
    } catch (error) {
      console.log(error);
    }
  };

  const deleteFile = useMutation({
    mutationFn: async (task: Task) => {
      const response = await axios.delete(`/api/removeFile/${task.title}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["files"]);
      console.log("success");
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
          >
            <DotsHorizontalIcon className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[160px]">
          <DialogTrigger className="w-full">
            <DropdownMenuItem>Edit</DropdownMenuItem>
          </DialogTrigger>
          <DropdownMenuItem
            onClick={() => {
              deleteFile.mutate(task);
              console.log("delete", task);
            }}
          >
            Delete
            <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit File</DialogTitle>
          <DialogDescription>Edit the metadata of the file.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid grid-cols1 sm:grid-cols-2 gap-2">
              <FormField
                control={form.control}
                name="isInternal"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 py-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel>Internal</FormLabel>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="isConfidential"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 py-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel>Confidential</FormLabel>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Document</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Document Type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {documentTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter className="gap-2">
              <Button
                onClick={() => {
                  form.reset();
                  setIsOpen(false);
                }}
                variant="outline"
              >
                Cancel
              </Button>
              <Button type="submit">
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
