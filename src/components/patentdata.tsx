import { Message } from "ai/react/dist";
import React, { useEffect } from "react";
import { Result } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";
import {
  Dialog,
  DialogTrigger,
  DialogTitle,
  DialogContent,
  DialogHeader,
  DialogFooter,
} from "@/components/ui/dialog";
import { AspectRatio } from "@/components/aspectratio";
import { ScrollArea, ScrollBar } from "@/components/scrollarea";

import { ArrowSquareUpRight } from "@phosphor-icons/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/button";

type Props = {};

const PatentData = ({ message }: { message: Message }) => {
  const parsedInput: Result[] = JSON.parse(message.content);

  const [itemIndex, setItemIndex] = React.useState(0);

  useEffect(() => {
    console.log("itemIndex", itemIndex);
  }, [itemIndex]);

  return (
    // <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 py-3 px-4">
    <ScrollArea>
      <div className="grid grid-flow-col w-max gap-2 py-3 px-4">
        {parsedInput.map((result, index) => (
          <Dialog key={index}>
            <DialogTrigger asChild>
              <div
                className="text-sm hover:ring-1 ring-ring hover:bg-secondary rounded-sm px-4 py-3 grid grid-cols-1 gap-2"
                key={index}
                onClick={() => setItemIndex(index)}
              >
                <div className="w-[150px]">
                  <AspectRatio ratio={2 / 3}>
                    <Image
                      src={result.image}
                      alt={result.title}
                      fill
                      className="rounded object-cover"
                    />
                  </AspectRatio>
                </div>
                <p className="scroll-m-20 tracking-tight text-xs line-clamp-2 w-[150px]">
                  {result.title}
                </p>
              </div>
            </DialogTrigger>
            <DialogContent className="overflow-hidden ">
              <div className="grid grid-flow-col p-4">
                {parsedInput
                  .slice(itemIndex, itemIndex + 1)
                  .map((result, index) => (
                    <div key={result.id} className="grid gap-6">
                      <DialogHeader className="h-10">
                        <DialogTitle className="relative line-clamp-2">
                          <Link
                            target="_blank"
                            className=""
                            href={`https://patents.google.com/patent/${result.id}`}
                          >
                            <span className="text-lg leading-none tracking-normal">
                              {result.title
                                .split(" ")
                                .map(
                                  (word, index) =>
                                    word[0].toUpperCase() +
                                    word.slice(1).toLowerCase(),
                                )
                                .join(" ")}
                            </span>
                          </Link>
                          <Link
                            target="_blank"
                            className="underline underline-offset-4 hover:text-primary inline-block absolute right-0 bottom-0 "
                            href={`https://patents.google.com/patent/${result.id}`}
                          >
                            <ArrowSquareUpRight className="h-4 w-4" />
                          </Link>
                        </DialogTitle>
                      </DialogHeader>
                      <div className="grid grid-flow-col gap-2">
                        <div className="w-[150px]">
                          <AspectRatio ratio={2 / 3}>
                            <Image
                              src={result.image}
                              alt={result.title}
                              fill
                              className="rounded object-cover"
                            />
                          </AspectRatio>
                        </div>
                        <ScrollArea className="">
                          <p className="leading-normal text-xs max-h-[225px]">
                            {result.abstract}
                          </p>
                          <ScrollBar orientation="vertical" />
                        </ScrollArea>
                      </div>
                      <DialogFooter className="text-sm">
                        <div className="w-full flex flex-col gap-4 ">
                          <div className="flex justify-between items-center">
                            <Link
                              target="_blank"
                              className="underline underline-offset-4 hover:text-primary text-xs "
                              href={`https://patents.google.com/patent/${result.id}`}
                            >
                              <p className=" text-ellipsis  whitespace-nowrap max-w-[40%] overflow-hidden">
                                {result.owner}
                              </p>
                            </Link>
                            <Link
                              target="_blank"
                              className="underline underline-offset-4 hover:text-primary text-xs"
                              href={`https://patents.google.com/patent/${result.id}`}
                            >
                              <p className="">
                                {result.publication_date as unknown as string}
                              </p>
                            </Link>
                          </div>
                          <div className="flex justify-end gap-2">
                            {!(itemIndex === 0) ? (
                              <Button
                                onClick={() => setItemIndex((prev) => prev - 1)}
                                // disabled={pageNo <= 1 ? true : false}
                                variant="ghost"
                                // size="xs"
                              >
                                <ChevronLeft className="h-4 w-4" />
                              </Button>
                            ) : null}
                            {itemIndex !== 4 ? (
                              <Button
                                onClick={() => setItemIndex((prev) => prev + 1)}
                                variant="ghost"
                                // size="xs"
                              >
                                <ChevronRight className="h-4 w-4" />
                              </Button>
                            ) : null}
                          </div>
                        </div>
                      </DialogFooter>
                    </div>
                  ))}
              </div>
            </DialogContent>
          </Dialog>
        ))}
      </div>

      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
};

export default PatentData;
