"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import logo from "@/assets/logo.png";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const headerVariants = cva("w-full", {
  variants: {
    variant: {
      default: "",
      sticky: "fixed bg-black",
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
          "z-50 sticky top-0 p-5"
        )}
        ref={ref}
        {...props}
      >
        <div className="flex justify-between items-center">
          <Link
            href="/"
            className="gap-2 flex items-center cursor-pointer h-[32px]"
          >
            <Image
              src={logo}
              alt="logo"
              className="w-6 h-6 border-gray-700 border-2"
            />
            <h1 className="text-gray-200 align-middle">Echoes</h1>
          </Link>
          {props.children}
          <SignedIn>
            <div className="flex justify-between">
              <UserButton />
            </div>
          </SignedIn>
          <SignedOut></SignedOut>
        </div>
        <div className="">{newChild}</div>
      </header>
    );
  }
);

Header.displayName = "Header";

export { Header };
