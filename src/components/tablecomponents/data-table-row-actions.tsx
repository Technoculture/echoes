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
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { PERMISSIONS, USER_ROLES } from "@/utils/constants";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radiogroup";
import { toast } from "@/components/ui/use-toast";

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
}

const documentTypes = ["patent", "paper", "documentation", "report"];
const documentEnum = z.enum(["patent", "paper", "documentation", "report"]);
const fileFormSchema = z.object({
  confidentiality: z.enum(["confidential", "non-confidential"]),
  access: z.enum(["internal", "external"]),
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
  const { orgSlug, has } = useAuth();

  let isDeletePermitted = false;
  if (has) {
    // @ts-ignore
    isDeletePermitted = has({
      role: USER_ROLES.principalInvestigator,
      permission: PERMISSIONS.deleteFile,
    });
  }
  let isEditPermitted = false;
  if (has) {
    // @ts-ignore
    isEditPermitted = has({
      role: USER_ROLES.principalInvestigator,
      permission: PERMISSIONS.uploadFile,
    });
  }

  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof fileFormSchema>>({
    resolver: zodResolver(fileFormSchema),
    defaultValues: {
      // confidentiality: "confidential",
      confidentiality:
        task.access === "confidential" ? "confidential" : "non-confidential",
      access: task.label === "internal" ? "internal" : "external",
      type: taskType,
    },
  });

  const onSubmit = async (data: z.infer<typeof fileFormSchema>) => {
    console.log(data);
    setIsSaving(true);
    console.log("data", data);
    toast({
      title: "You submitted the following values:",

      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    });

    try {
      const res = await axios.patch("/api/updateFileMetadata", {
        fileName: task.title,
        orgSlug: orgSlug,
        metadata: {
          id: task.id,
          "file-name": task.title,
          "added-by": task.addedBy,
          "added-on": task.addedOn,
          confidentiality: data.confidentiality,
          "access-level": data.access,
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
          <DialogTrigger disabled={!isEditPermitted} className="w-full">
            <DropdownMenuItem>Edit</DropdownMenuItem>
          </DialogTrigger>
          <DropdownMenuItem
            disabled={!isDeletePermitted}
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
                name="access"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>
                      Is this document generated by Organisation?
                    </FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="internal" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Internal
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="external" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            External
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confidentiality"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Is this document confidential?</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="confidential" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Confidential
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="non-confidential" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Non-confidential
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
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
