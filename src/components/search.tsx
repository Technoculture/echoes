"use client";

import {
  CommandDialog,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
  // CommandSeparator,
  CommandGroup,
  // CommandShortcut,
} from "@/components/ui/command";
// import { MessageSquarePlus, PenTool } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import algoliasearch from "algoliasearch";
import { env } from "@/app/env.mjs";
import Link from "next/link";
import { timestampToDate } from "@/utils/helpers";
import UserAvatar from "@/components/useravatars";
import useSearchDialogState from "@/store/searchDialogStore";
import { useThrottle } from "@uidotdev/usehooks";

type Props = {
  orgSlug: string;
};

const Search = (props: Props) => {
  // const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const throttledValue = useThrottle(value, 700);
  const [results, setResults] = useState<any>([]);
  const { showSearchDialog, toggleSearchDialog } = useSearchDialogState();

  const client = useMemo(
    () =>
      algoliasearch(
        env.NEXT_PUBLIC_ALGOLIA_APP_ID,
        env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY,
      ),
    [],
  );

  const index = useMemo(
    () => client.initIndex(env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME),
    [],
  );

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "/" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        toggleSearchDialog();
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []); // open command bar with / key

  useEffect(() => {
    index
      .search(throttledValue, {
        hitsPerPage: 8,
        filters: `orgSlug: "${props.orgSlug}"`,
      })
      .then((response) => {
        console.log(response);
        return setResults(response.hits);
      });
  }, [throttledValue]);

  return (
    <CommandDialog open={showSearchDialog} onOpenChange={toggleSearchDialog}>
      <CommandInput
        onValueChange={(val) => {
          console.log("got the input value");
          setValue(val);
        }}
        value={value}
        placeholder="Type a command or search..."
      />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        {/*
        <CommandGroup heading="Commands">
          <CommandItem>
            <MessageSquarePlus className="w-3 h-3 mr-2" />
            <span>Start a New Chat</span>
            <CommandShortcut>⌘N</CommandShortcut>
          </CommandItem>
          <CommandItem>
            <PenTool className="w-3 h-3 mr-2" />
            <span>Create a New Diagram</span>
            <CommandShortcut>⌘D</CommandShortcut>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Files">
        </CommandGroup>
        <CommandSeparator />
        */}
        <CommandGroup heading="Chat History">
          {results.length
            ? results.map((result: any, index: number) => (
                <CommandItem key={index}>
                  <Link
                    href={
                      result.id
                        ? `/dashboard/${props.orgSlug}/chat/${result.chatId}/#${result.id}`
                        : `/dashboard/${props.orgSlug}/chat/${result.chatId}`
                    } // needs to be updated
                    onClick={toggleSearchDialog}
                    key={result.objectID}
                    className="flex gap-2 grow justify-between"
                  >
                    <div>
                      <p className="text-md text-muted-foreground">
                        {result.chatTitle
                          .replace('"', "")
                          .replace('"', "")
                          .split(" ")
                          .slice(0, 5)
                          .join(" ")}
                        {" (" + timestampToDate(result.updatedAt)})
                      </p>
                      <p className="line-clamp-1 text-sm">
                        {result.content ? result.content : null}
                      </p>
                    </div>
                    <UserAvatar role={result.role} userData={result.name} />
                  </Link>
                </CommandItem>
              ))
            : null}
        </CommandGroup>
        {/*
        <CommandGroup heading="Patents">
          <CommandItem>Hello</CommandItem>
        </CommandGroup>
        */}
      </CommandList>
    </CommandDialog>
  );
};

export default Search;
