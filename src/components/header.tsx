"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import logo from "@/assets/logo.png";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import CustomProfile from "@/components/customProfile";

const headerVariants = cva("w-full", {
  variants: {
    variant: {
      default: "",
      sticky: "fixed bg-background",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export interface HeaderProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof headerVariants> {
  newChild?: React.ReactNode;
}

const Header = React.forwardRef<HTMLDivElement, HeaderProps>(
  ({ className, newChild, variant, ...props }: HeaderProps = {}, ref) => {
    return (
      <header
        className={cn(
          headerVariants({ variant, className }),
          "z-50 fixed top-0 p-5 flex flex-col",
        )}
        ref={ref}
        {...props}
      >
        <div className="grid grid-cols-3">
          <Link
            href="/"
            className="gap-2 flex items-center cursor-pointer h-[32px]"
          >
            <Image
              src={logo}
              alt="logo"
              className="w-6 h-6 border-zinc-700 border-2"
            />
            <h1 className="text-primary align-middle">Echoes</h1>
          </Link>
          <div className="flex gap-2 mx-auto">{props.children}</div>
          <SignedIn>
            <div className="flex justify-end">
              <CustomProfile />
            </div>
          </SignedIn>
          <SignedOut></SignedOut>
        </div>
        <div className="">{newChild}</div>
      </header>
    );
  },
);

Header.displayName = "Header";

export { Header };
