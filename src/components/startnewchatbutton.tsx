"use client";

import { Dispatch, SetStateAction, useState } from "react";
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
import { MessageSquarePlus, PenTool, Database } from "lucide-react";

interface Props {
  org_slug: string;
  org_id: string;
}

const formSchema = z.object({
  title: z.string().min(2).max(100),
});

const Startnewchatbutton = (props: Props) => {
  const [showLoading, setShowLoading] = useState(false); // normal chat
  const [isKnowledgeChatLoading, setIsKnowledgeChatLoading] = useState(false); // knowledge chat
  const [isEllaChatLoading, setIsEllaChatLoading] = useState(false); // knowledge chat
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
      <DialogTrigger asChild className="max-w-max">
        <Button variant="outline" size="default">
          <>
            <Plus className="w-4 h-4 mr-2" />
            <span className="sm:mr-1">New</span>
            <span className="hidden sm:inline"> Chat </span>
          </>
        </Button>
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
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
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
                  <MessageSquarePlus className="w-4 h-4 mr-2" />
                  New Chat
                </>
              )}
            </Button>
            <Button
              variant="outline"
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
                  <PenTool className="w-4 h-4 mr-2" />
                  New Diagram
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                handleNavigate("rag", setIsKnowledgeChatLoading, ""); // TODO: update loading state
              }}
              disabled={showLoading || isBoardCreating || showTitleInput}
            >
              {isKnowledgeChatLoading ? (
                <>
                  <CircleNotch className="w-4 h-4 mr-2 animate-spin" />
                  Initiating Knowledge Chat
                </>
              ) : (
                <>
                  <Database className="w-4 h-4 mr-2" />
                  New Knowledge chat
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                handleNavigate("ella", setIsEllaChatLoading, "");
              }}
              disabled={showLoading || isBoardCreating || showTitleInput || isEllaChatLoading}
            >
              {isEllaChatLoading ? (
                <>
                  <CircleNotch className="w-4 h-4 mr-2 animate-spin" />
                  Starting New Ella Chat
                </>
              ) : (
                <>
                  <MessageSquarePlus className="w-4 h-4 mr-2" />
                  New Ella Chat
                </>
              )}
            </Button>
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
