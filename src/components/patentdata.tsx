import { Message } from "ai/react/dist";
import React from "react";
import { Result } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";
import {
  Dialog,
  DialogTrigger,
  DialogTitle,
  DialogContent,
  DialogHeader,
} from "@/components/ui/dialog";
type Props = {};

const PatentData = ({ message }: { message: Message }) => {
  const parsedInput: Result[] = JSON.parse(message.content);
  return (
    <div className="grid grid-cols-3 gap-2  py-3 px-4">
      {parsedInput.map((result, index) => (
        <Dialog key={index}>
          <DialogTrigger asChild>
            <div
              className="text-sm hover:ring-1 ring-ring hover:bg-secondary rounded-sm px-4 py-3 grid grid-cols-1 gap-2"
              key={index}
            >
              <h3 className="scroll-m-20 tracking-tight whitespace-nowrap overflow-hidden text-ellipsis text-center">
                {result.title}
              </h3>
              <div>
                <Image
                  src={result.image}
                  alt={result.title}
                  width={200}
                  height={200}
                />
                <Link
                  className="underline underline-offset-4 hover:text-primary text-center"
                  target="_blank"
                  href={`https://patents.google.com/patent/${result.id}/en`}
                >
                  {result.id}
                </Link>
                {/* <p className="leading-normal [&:not(:first-child)]:my-4 whitespace-nowrap overflow-hidden text-ellipsis">
              {result.abstract}
            </p> */}
              </div>
            </div>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{result.title}</DialogTitle>
            </DialogHeader>
            <div
              className=" rounded-sm px-4 py-3 grid grid-cols-1 gap-2"
              key={index}
            >
              <div>
                <Image
                  src={result.image}
                  alt={result.title}
                  width={200}
                  height={200}
                />
                <Link
                  className="underline underline-offset-4 hover:text-primary text-center"
                  target="_blank"
                  href={`https://patents.google.com/patent/${result.id}/en`}
                >
                  {result.id}
                </Link>
                <p className="leading-normal [&:not(:first-child)]:my-4">
                  {result.abstract}
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      ))}
    </div>
  );
};

export default PatentData;
