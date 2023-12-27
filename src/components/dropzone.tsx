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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radiogroup";
import { toast } from "@/components/ui/use-toast";

const documentTypes = ["patent", "paper", "documentation", "report"];
const fileFormSchema = z.object({
  fileName: z.string().min(2, {
    message: "At least 1 author required.",
  }),
  confidentiality: z.enum(["confidential", "non-confidential"]),
  access: z.enum(["internal", "external"]),
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
      confidentiality: "non-confidential",
      access: "external",
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

    toast({
      title: "You submitted the following values:",

      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(values, null, 2)}</code>
        </pre>
      ),
    });

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
