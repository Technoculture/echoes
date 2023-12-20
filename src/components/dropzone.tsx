"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus } from "lucide-react";
import React, { Dispatch, SetStateAction, useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useForm } from "react-hook-form";
import * as z from "zod";
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
import { DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/button";
import { CrossCircledIcon } from "@radix-ui/react-icons";
import { nanoid } from "ai";
import { useQueryClient } from "@tanstack/react-query";
import { Checkbox } from "@/components/ui/checkbox";

const documentTypes = ["patent", "paper", "documentation", "report"];
const fileFormSchema = z.object({
  fileName: z.string().min(2, {
    message: "At least 1 author required.",
  }),
  isConfidential: z.boolean(),
  isInternal: z.boolean(),
  type: z.enum(["patent", "paper", "documentation", "report"]),
});

type Props = {
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  orgSlug: string;
  username: string;
  userId: string;
};

const DropZone = (props: Props) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [fileName, setFileName] = useState<string>();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof fileFormSchema>>({
    resolver: zodResolver(fileFormSchema),
    defaultValues: {
      fileName: "",
      isConfidential: true,
      isInternal: true,
      type: "documentation",
    },
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    console.log("accepted file", acceptedFiles[0]);
    setFile(acceptedFiles[0]);
    form.setValue("fileName", acceptedFiles[0].name);
    setFileName(acceptedFiles[0].name);
  }, []);

  const removeFile = useCallback(
    (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      e.preventDefault();
      e.stopPropagation();
      setFile(null);
      setFileName("");
    },
    [],
  );

  const onDropCallback = useCallback(
    (acceptedFiles: File[]) => {
      onDrop(acceptedFiles);
    },
    [onDrop],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onDropCallback,
    accept: { "application/pdf": [".pdf"] },
  });

  const onSubmit = async (values: z.infer<typeof fileFormSchema>) => {
    console.log("values", values);

    // const startUploading = async () => {
    setIsUploading(true);
    console.log("uploading");
    if (file) {
      const response = await fetch(`/api/postFile`, {
        method: "POST",
        body: JSON.stringify({
          id: nanoid(),
          fileType: file?.type,
          ...values,
          userName: props.username,
          userId: props.userId,
          orgSlug: props.orgSlug,
          // username: props.username,
          // userId: props.userId,
          // chatId: props.chatId,
          // orgSlug: props.orgSlug,
          // orgId: props.orgId,
        }),
      });
      const data = await response.json();
      const { postUrl, getUrl } = data;
      try {
        const upload = await fetch(postUrl, {
          method: "PUT",
          body: file,
        });
        if (upload.ok) {
          console.log("Uploaded successfully!");
        } else {
          console.error("Upload failed.");
        }
      } catch (error) {
        console.error("Upload failed.", error);
      }
    }
    //
    queryClient.invalidateQueries(["files"]);
    props.setIsOpen(false);
    setIsUploading(false);
    setFile(null);
    // setOpen(false)
    // };
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="space-y-4">
          {!!file && (
            <div className="min-h-max w-full grid rounded-md ">
              <div className="grid  grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs line-clamp-2">{file?.name}</span>
                  <CrossCircledIcon
                    onClick={() => {
                      setFile(null);
                      setFileName("");
                      console.log("remove file");
                    }}
                    className="h-6 w-6 cursor-pointer"
                  />
                </div>
                <div className="flex text-sm items-center justify-between">
                  <span>Size: </span>
                  <span className="text-xs">
                    {Math.round(file.size / 1000)} KB{" "}
                  </span>
                </div>
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
            </div>
          )}
          {!!!file && (
            <div
              className="h-52 w-full flex justify-center items-center cursor-pointer rounded-md"
              {...getRootProps()}
            >
              <div className="flex flex-col items-center">
                <input {...getInputProps()} />
                <Plus className="text-4xl" color="white" />
                {!isDragActive ? (
                  <span className="text-xs">
                    Choose a file or Drop it here.
                  </span>
                ) : (
                  <span className="text-xs">Drop it here.</span>
                )}
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button
              onClick={() => {
                form.reset();
                props.setIsOpen(false);
              }}
              variant="outline"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!!!file}>
              {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </div>
      </form>
    </Form>
  );
};

export default DropZone;
