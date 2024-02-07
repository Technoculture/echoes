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
// import { HumanMessage } from "@langchain/core/messages";

// import {
//   Drawer,
//   DrawerClose,
//   DrawerContent,
//   DrawerDescription,
//   DrawerFooter,
//   DrawerHeader,
//   DrawerTitle,
//   DrawerTrigger,
// } from "@/components/ui/drawer"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
import { ImageSquare } from "@phosphor-icons/react";

export function DropzoneDrawer(props: any) {
  const [open, setOpen] = React.useState(props.open);

  const handleDropzone = (acceptedFiles: File[]) => {
    console.log(acceptedFiles[0]);
    setOpen(false);
  };
  //   const isDesktop = useMediaQuery("(min-width: 768px)")

  //   if (isDesktop) {

  //   const chat = new ChatOpenAI({
  //     modelName: "gpt-4-vision-preview",
  //     maxTokens: 1024,
  //     openAIApiKey:env.OPEN_AI_API_KEY
  //   });

  //   const handleSubmit = async (acceptedFiles:File[]) => {
  //     try {
  //       const file = acceptedFiles[0];
  //       const reader = new FileReader();

  //       reader.onload = async () => {
  //         const imageBase64:any = reader.result;
  //         console.log("imagebase64",imageBase64)

  //         const message = new HumanMessage({
  //           content: [
  //             {
  //               type: "text",
  //               text: "What's in this image?",
  //             },
  //             {
  //               type: "image_url",
  //               image_url: imageBase64,
  //             },
  //           ],
  //         });

  //         const res = await chat.invoke([message]);
  //         console.log("response", res);
  //       };

  //       reader.readAsDataURL(file);
  //     } catch (error) {
  //       console.error("Error invoking chat:", error);
  //     }
  //   };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="icon" variant="secondary" className="disabled:text-muted">
          <ImageSquare className="h-4 w-4 fill-current" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] min-w-[90vw] min-h-[90vh] bg-transparent">
        <DialogHeader>
          <DialogTitle>DropZone</DialogTitle>
          <DialogDescription>
            <div>
              <Dropzone
                onDrop={(acceptedFiles) => handleDropzone(acceptedFiles)}
              >
                {({ getRootProps, getInputProps }) => (
                  <section>
                    <div
                      style={{
                        // background: "red",
                        height: "90vh",
                        width: "86vw",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                      {...getRootProps()}
                    >
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

//   return (
//     <Drawer open={open} onOpenChange={setOpen}>
//       <DrawerTrigger asChild>
//         <Button variant="outline">Edit Profile</Button>
//       </DrawerTrigger>
//       <DrawerContent>
//         <DrawerHeader className="text-left">
//           <DrawerTitle>Edit profile</DrawerTitle>
//           <DrawerDescription>
//             Make changes to your profile here. Click save when you're done.
//           </DrawerDescription>
//         </DrawerHeader>
//         <DrawerFooter className="pt-2">
//           <DrawerClose asChild>
//             <Button variant="outline">Cancel</Button>
//           </DrawerClose>
//         </DrawerFooter>
//       </DrawerContent>
//     </Drawer>
//   )
// }
