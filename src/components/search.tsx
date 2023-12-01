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

type Props = {};

const Search = (props: Props) => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [results, setResults] = useState<any>([]);

  const client = useMemo(
    () =>
      algoliasearch(
        env.NEXT_PUBLIC_ALGOLIA_APP_ID,
        env.NEXT_PUBLIC_ALGOLIA_API_KEY,
      ),
    [],
  );

  const index = useMemo(() => client.initIndex("test_index"), []);

  useEffect(() => {
    index.search(value, { hitsPerPage: 8 }).then((response) => {
      setResults(response.hits);
    });
  }, [value]);

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
        <Button variant="ghost">
          <SearchIcon className="h-4 w-4" />
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
            {results.length &&
              results.map((result: any) => (
                <Link
                  href={`/usr/technoculture/chat/${result.chatId}/#${result.objectID}`} // needs to be updated
                  onClick={() => setOpen(false)}
                  key={result.objectID}
                >
                  <CommandItem className="pointer-events-auto">
                    <div className="select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground flex flex-row justify-between items-center">
                      <div>
                        {result.chatTitle
                          .replace('"', "")
                          .replace('"', "")
                          .split(" ")
                          .slice(0, 5)
                          .join(" ")}
                        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                          {result.content.split(" ").slice(0, 5).join(" ")}
                        </p>
                      </div>
                    </div>
                  </CommandItem>
                </Link>
              ))}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
};

export default Search;
