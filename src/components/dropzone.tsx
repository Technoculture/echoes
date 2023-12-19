"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import React, { useCallback, useState } from "react";
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

const documentTypes = ["patent", "paper", "documentation", "report"];
const fileFormSchema = z.object({
  file: z.string(),
  authors: z.array(z.string()),
  confidentiality: z.enum(["non-confidential", "confidential"]),
  access: z.enum(["internal", "external"]),
  type: z.enum(["patent", "paper", "documentation", "report"]),
});

type Props = {};

const DropZone = (props: Props) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [fileName, setFileName] = useState<string>();

  const form = useForm<z.infer<typeof fileFormSchema>>({
    resolver: zodResolver(fileFormSchema),
    defaultValues: {
      file: "",
      authors: [],
      confidentiality: "confidential",
      access: "internal",
      type: "documentation",
    },
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    console.log("accepted file", acceptedFiles[0]);
    setFile(acceptedFiles[0]);
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
  };

  return (
    <div className="space-y-4">
      {!!file && (
        <div className="h-44 border-2 w-full grid px-4 rounded-md ">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="grid grid-cols-2 gap-2"
            >
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
            </form>
          </Form>
        </div>
      )}
      {!!!file && (
        <div
          className="h-44 border-2 w-full flex justify-center items-center cursor-pointer rounded-md"
          {...getRootProps()}
        >
          <div>
            <input {...getInputProps()} />
            <Plus className="text-4xl" color="white" />
          </div>
        </div>
      )}
      <DialogFooter>
        <Button variant="outline">Cancel</Button>
        <Button>Save</Button>
      </DialogFooter>
    </div>
  );
};

export default DropZone;
