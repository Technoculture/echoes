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
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
type Props = {};

const PatentData = ({ message }: { message: Message }) => {
  const parsedInput: Result[] = JSON.parse(message.content);
  const [accordionValue, setAccordionValue] = React.useState("");

  useEffect(() => {
    if (window.innerWidth > 1280) {
      // for desktop
      setAccordionValue("item-1");
    }
  }, []);

  return (
    <Accordion
      type="single"
      collapsible
      value={accordionValue}
      onValueChange={(val) => setAccordionValue(val)}
      className="px-4 py-3"
    >
      <AccordionItem value="item-1">
        <AccordionTrigger>Related Parent Data</AccordionTrigger>
        <AccordionContent>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 py-3 px-4">
            {parsedInput.map((result, index) => (
              <Dialog key={index}>
                <DialogTrigger asChild>
                  <div
                    className="text-sm hover:ring-1 ring-ring hover:bg-secondary rounded-sm px-4 py-3 grid grid-cols-1 gap-2"
                    key={index}
                  >
                    <div>
                      <AspectRatio ratio={2 / 3}>
                        <Image
                          src={result.image}
                          alt={result.title}
                          fill
                          className="rounded object-cover"
                        />
                      </AspectRatio>
                    </div>
                    <p className="scroll-m-20 tracking-tight text-xs line-clamp-2">
                      {result.title}
                    </p>
                  </div>
                </DialogTrigger>
                <DialogContent className=" grid gap-6 max-h-[500px] px-12 py-12 ">
                  <DialogHeader className="">
                    <DialogTitle className=" relative line-clamp-2">
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
                      <Link
                        target="_blank"
                        className="underline underline-offset-4 hover:text-primary inline-block absolute right-0 bottom-0 "
                        href={`https://patents.google.com/patent/${result.id}`}
                      >
                        <ArrowSquareUpRight className="h-4 w-4" />
                      </Link>
                    </DialogTitle>
                  </DialogHeader>
                  <div className="grid sm:grid-cols-3 gap-4 max-h-[300px]">
                    <AspectRatio ratio={16 / 9} className="max-h-[300px]">
                      <Image
                        src={result.image}
                        alt={result.title}
                        fill
                        className="rounded object-cover"
                      />
                    </AspectRatio>
                    <ScrollArea className="sm:col-span-2">
                      <p className="leading-normal text-sm">
                        {result.abstract}
                      </p>
                      <ScrollBar orientation="vertical" />
                    </ScrollArea>
                  </div>
                  <DialogFooter className="flex flex-row justify-between sm:justify-between gap-4 text-xs">
                    <p className=" text-ellipsis whitespace-nowrap max-w-[40%] overflow-hidden">
                      {result.owner}
                    </p>
                    <p className="">
                      {result.publication_date as unknown as string}
                    </p>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default PatentData;
