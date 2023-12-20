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
import { Input } from "@/components/ui/input";
import { DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/button";
import { CrossCircledIcon } from "@radix-ui/react-icons";
import { nanoid } from "ai";

const documentTypes = ["patent", "paper", "documentation", "report"];
const fileFormSchema = z
  .object({
    fileName: z.string().min(2, {
      message: "At least 1 author required.",
    }),
    authors: z.string(),
    confidentiality: z.enum(["non-confidential", "confidential"]),
    access: z.enum(["internal", "external"]),
    type: z.enum(["patent", "paper", "documentation", "report"]),
  })
  .refine(
    (data) => {
      const names = data.authors.split(",").map((name) => name.trim());
      // Ensure each name has at least 2 characters
      return names.every((name) => name.length >= 2);
    },
    {
      message: "Each name must have at least 2 characters",
      path: ["authors"],
    },
  );

type Props = {
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  username: string;
  userId: string;
};

const DropZone = (props: Props) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [fileName, setFileName] = useState<string>();

  const form = useForm<z.infer<typeof fileFormSchema>>({
    resolver: zodResolver(fileFormSchema),
    defaultValues: {
      fileName: "",
      authors: "",
      confidentiality: "confidential",
      access: "internal",
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

          // username: props.username,
          // userId: props.userId,
          // chatId: props.chatId,
          // orgSlug: props.orgSlug,
          // orgId: props.orgId,
        }),
      });
      const data = await response.json();
      const { postUrl, getUrl } = data;
      const upload = await fetch(postUrl, {
        method: "PUT",
        body: file,
      });

      // testing the get url
      // try{
      //   let file = await fetch(getUrl);
      //   console.log("file", await file.json())
      // } catch(err) {
      //   console.log("jsonn error", err)
      // }

      if (upload.ok) {
        console.log("Uploaded successfully!");
      } else {
        console.error("Upload failed.");
      }
    }
    //
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
            <div className="min-h-max border-2 w-full grid px-4 py-2 rounded-md ">
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
                  name="authors"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Authors</FormLabel>
                      <FormControl>
                        <Input placeholder="shadcn" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confidentiality"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>confidentiality:</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Confidiently" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="confidential">
                            confidential
                          </SelectItem>
                          <SelectItem value="non-confidential">
                            non-confidential
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="access"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Access</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Access" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="internal">Internal</SelectItem>
                          <SelectItem value="external">External</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Document Type</FormLabel>
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
              className="h-52 border-2 w-full flex justify-center items-center cursor-pointer rounded-md"
              {...getRootProps()}
            >
              <div>
                <input {...getInputProps()} />
                <Plus className="text-4xl" color="white" />
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
            <Button type="submit">
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
