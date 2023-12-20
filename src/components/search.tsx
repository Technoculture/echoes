"use client";

import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Search as SearchIcon } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/button";
import algoliasearch from "algoliasearch";
import { env } from "@/app/env.mjs";
import Link from "next/link";
import { timestampToDate } from "@/utils/helpers";
import UserAvatar from "@/components/useravatars";
import { useThrottle } from "@uidotdev/usehooks";
type Props = {
  orgSlug: string;
};

const Search = (props: Props) => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [results, setResults] = useState<any>([]);
  const throttledValue = useThrottle(value, 1000);

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
      if (e.key === "/") {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []); // open command bar with / key

  useEffect(() => {
    index
      .search(value, { hitsPerPage: 8, filters: `orgSlug: "${props.orgSlug}"` })
      .then((response) => {
        setResults(response.hits);
      });
  }, [throttledValue]);

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        if (!val) {
          console.log("triggering me");
          setValue("");
        }
        setOpen(val);
      }}
    >
      <DialogTrigger asChild className="max-h-[32px]">
        <Button variant="ghost" className="max-h-[32px]">
          <div className="flex items-center gap-2">
            <SearchIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Search</span>
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <Command shouldFilter={false} className="rounded-lg shadow-md">
          <CommandInput
            onValueChange={setValue}
            value={value}
            placeholder="Search..."
          />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            {results.length
              ? results.map((result: any) => (
                  <Link
                    href={
                      result.id
                        ? `/dashboard/${props.orgSlug}/chat/${result.chatId}/#${result.id}`
                        : `/dashboard/${props.orgSlug}/chat/${result.chatId}`
                    } // needs to be updated
                    onClick={() => setOpen(false)}
                    key={result.objectID}
                  >
                    <CommandItem className="pointer-events-auto w-full">
                      <div className="select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none text-accent-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground flex flex-row justify-between items-center w-full">
                        <div className="flex flex-col gap-2">
                          <div className="">
                            {result.chatTitle
                              .replace('"', "")
                              .replace('"', "")
                              .split(" ")
                              .slice(0, 5)
                              .join(" ")}
                            <p className=" ml-1 line-clamp-2 text-sm leading-snug text-muted-foreground">
                              {result.content
                                ? result.content
                                    .split(" ")
                                    .slice(0, 5)
                                    .join(" ")
                                : null}
                            </p>
                          </div>
                          <p className="line-clamp-2 text-xs leading-snug text-muted-foreground">
                            Last Updated At :{" "}
                            {timestampToDate(result.updatedAt)}
                          </p>
                        </div>
                        <UserAvatar role={result.role} userData={result.name} />
                      </div>
                    </CommandItem>
                  </Link>
                ))
              : null}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
};

export default Search;
