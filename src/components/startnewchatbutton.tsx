"use client";

import { Dispatch, SetStateAction, useState } from "react";
import { buttonVariants } from "@/components/button";
import { useRouter } from "next/navigation";
import { Plus, CircleNotch } from "@phosphor-icons/react";
import { ChatType } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/button";
import * as z from "zod";
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

interface Props {
  org_slug: string;
  org_id: string;
}

const formSchema = z.object({
  title: z.string().min(2).max(100),
});

const Startnewchatbutton = (props: Props) => {
  const [showLoading, setShowLoading] = useState(false);
  const [isBoardCreating, setIsBoardCreating] = useState(false);
  const [showTitleInput, setShowTitleInput] = useState(false);
  const [title, setTitle] = useState("");

  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
    },
  });

  const handleNavigate = async (
    type: ChatType,
    isLoding: Dispatch<SetStateAction<boolean>>,
    title?: string,
  ) => {
    if (type === "tldraw" && !title) {
      setShowTitleInput(true);
      return;
    }
    isLoding(true);

    const res = await fetch(`/api/generateNewChatId/${props.org_id}`, {
      method: "POST",
      body: JSON.stringify({ type: type, title: title }),
    });
    const data = await res.json();
    isLoding(false);
    router.push(`/dashboard/${props.org_slug}/chat/${Number(data.newChatId)}`);
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(val) => {
        if (!val) {
          setShowLoading(false);
          setIsBoardCreating(false);
          setShowTitleInput(false);
          form.reset();
        }
        setIsOpen(val);
      }}
    >
      <DialogTrigger asChild>
        <button className={buttonVariants({ variant: "outline" })}>
          <>
            <Plus className="w-4 h-4 mr-2" />
            New Chat
          </>
        </button>
      </DialogTrigger>
      <DialogContent
        onInteractOutside={(e) => {
          if (showLoading || isBoardCreating) {
            e.preventDefault();
          }
        }}
      >
        <DialogHeader>
          <DialogTitle>Start New Chat</DialogTitle>
        </DialogHeader>
        {/* show two boxes. one for a chat another for a tldraw */}
        {!showTitleInput && (
          <div className="flex flex-col gap-2">
            <Button
              variant="outline"
              className={buttonVariants({ variant: "outline" })}
              onClick={() => {
                // setShowLoading(true);
                handleNavigate("chat", setShowLoading, "");
              }}
              disabled={showLoading || isBoardCreating || showTitleInput}
            >
              {showLoading ? (
                <>
                  <CircleNotch className="w-4 h-4 mr-2 animate-spin" />
                  Starting New Chat
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  New Chat
                </>
              )}
            </Button>
            <button
              className={buttonVariants({ variant: "outline" })}
              onClick={() => {
                setShowTitleInput(true);
              }}
              disabled={showLoading || isBoardCreating || showTitleInput}
            >
              {isBoardCreating ? (
                <>
                  <CircleNotch className="w-4 h-4 mr-2 animate-spin" />
                  Initiating Board
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  New Tldraw
                </>
              )}
            </button>
          </div>
        )}
        {showTitleInput && (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((vals) => {
                handleNavigate("tldraw", setIsBoardCreating, vals.title);
              })}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Write a title for the board"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end">
                <Button variant="outline" type="submit">
                  {isBoardCreating && (
                    <CircleNotch className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  Submit
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default Startnewchatbutton;
