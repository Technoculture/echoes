"use client";
import React, { Dispatch, SetStateAction, useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
// import Card from 'shad-cn-card';
import { Card } from "@/components/card";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/dialog";
import { Button } from "./button";
import { DialogHeader, DialogFooter } from "./dialog";
import { CircleNotch, XCircle } from "@phosphor-icons/react";
import { FilePdf } from "@phosphor-icons/react";

interface DropFileProps {
  setCollectionName: Dispatch<SetStateAction<string>>;
}

const DropFile: React.FC<DropFileProps> = (props) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  // const [open, setOpen] = useState(false)
  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFile(acceptedFiles[0]);
  }, []);

  const removeFile = useCallback(
    (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      e.stopPropagation();
      setFile(null);
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

  const startUploading = async () => {
    setIsUploading(true);
    console.log("uploading");

    const f = new FormData();
    f.append("pdf", file as Blob);
    f.append("name", file ? file.name : "random");
    const response = await fetch("/api/postPdf", {
      method: "POST",
      // headers: {
      //   'Content-Type': 'multipart/form-data'
      // },
      body: f,
    });
    const data = await response.json();
    console.log("collectionData", data);
    props.setCollectionName(data.collectionName);
    // console.log("response", await response.json());
    setIsUploading(false);
    setFile(null);
    // setOpen(false)
  };
  return (
    <Dialog
      onOpenChange={() => {
        setFile(null);
        setIsUploading(false);
        // setOpen(false)
      }}
      // open={open}
    >
      <DialogTrigger>
        <Button variant="ghost">Chat with pdf</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Choose PDF</DialogTitle>
          <DialogDescription>
            Drop or select pdf. Click upload when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        {/* <div className="grid gap-4 py-4"> */}
        <Card
          className="flex-row px-4 items-center justify-center"
          {...getRootProps()}
        >
          <input {...getInputProps()} />
          {/* {isDragActive ? (
              <p>Drop the files here ...</p>
            ) : (
              <p>Drag n drop some files here, or click to select files</p>
            )} */}
          <div className="h-32 w-32 py-2 mx-auto">
            {!file ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path
                  fill="currentColor"
                  fillRule="evenodd"
                  d="M5.5 17a4.5 4.5 0 0 1-1.44-8.765a4.5 4.5 0 0 1 8.302-3.046a3.5 3.5 0 0 1 4.504 4.272A4 4 0 0 1 15 17H5.5Zm3.75-2.75a.75.75 0 0 0 1.5 0V9.66l1.95 2.1a.75.75 0 1 0 1.1-1.02l-3.25-3.5a.75.75 0 0 0-1.1 0l-3.25 3.5a.75.75 0 1 0 1.1 1.02l1.95-2.1v4.59Z"
                  clipRule="evenodd"
                ></path>
              </svg>
            ) : (
              <div className=" w-full h-full flex flex-col items-center justify-center">
                <div className="relative">
                  <button
                    className="absolute right-0 top-0"
                    onClick={removeFile}
                  >
                    <XCircle size={28} color="#ffffff" weight="bold" />
                  </button>
                  <FilePdf size={96} color="#fafafa" weight="bold" />
                </div>
              </div>
            )}
          </div>
          {file && <p className="text-sm text-center">{file.name}</p>}
        </Card>
        <DialogFooter>
          <Button disabled={!file} onClick={startUploading} type="submit">
            {isUploading ? (
              <>
                Uploading...
                <CircleNotch className="animate-spin" />
              </>
            ) : (
              "Upload"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DropFile;

export const classNames = (...classes: Array<string | boolean>) => {
  return classes.filter(Boolean).join(" ");
};
