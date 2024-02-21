import * as React from "react";

// import { cn } from "@/lib/utils"
// import { useMediaQuery } from "@/hooks/use-media-query"
// import { useMediaQuery} from "@react-hook/media-query"
// import { Button } from "@/components/ui/button"
import { Button } from "./button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Dropzone from "react-dropzone";
// import { env } from "@/app/env.mjs";
// import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage } from "@langchain/core/messages";

import { ImageSquare } from "@phosphor-icons/react";

interface DropZoneProps {
  open: boolean;
  imageBase64: string;
}

export function DropzoneDrawer(props: DropZoneProps) {
  const [open, setOpen] = React.useState<boolean>(props.open);

  // const handleDropzone = (acceptedFiles: File[]) => {
  //   console.log(acceptedFiles[0]);
  //   setOpen(false);
  // };

  const handleSubmit = async (acceptedFiles: File[]) => {
    try {
      const file = acceptedFiles[0];
      const reader = new FileReader();

      reader.onload = async () => {
        const imageBase64 = reader.result;
        console.log("imagebase64", imageBase64);

        const message = new HumanMessage({
          content: [
            {
              type: "text",
              text: "What's in this image?",
            },
            {
              type: "image_url",
              image_url: imageBase64 as string,
            },
          ],
        });

        // const res = await chat.invoke([message]);
        // console.log("response", res);
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error invoking chat:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="icon" variant="secondary" className="disabled:text-muted">
          <ImageSquare className="h-4 w-4 fill-current" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>DropZone</DialogTitle>
          <DialogDescription>
            <div>
              <Dropzone onDrop={(acceptedFiles) => handleSubmit(acceptedFiles)}>
                {({ getRootProps, getInputProps }) => (
                  <section>
                    <div {...getRootProps()}>
                      <input {...getInputProps()} />
                      <p>
                        Drag 'n' drop some files here, or click to select files
                      </p>
                    </div>
                  </section>
                )}
              </Dropzone>
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
