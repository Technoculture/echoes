'use client';

import Image from 'next/image';
import Link from 'next/link';
import logo from '@/assets/logo.png';
import { Button } from '@/components/button';

import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton
} from "@clerk/nextjs";

interface HeaderProps {
  children?: React.ReactNode;
}

export default function Header({ children }: HeaderProps) {
  return (
    <header className='flex justify-between p-5'>
      <Link href="/" className='gap-2 flex items-center cursor-pointer h-[32px]'>
        <Image src={logo} alt="logo" className='w-6 h-6 border-gray-700 border-2' />
        <h1 className="text-gray-200 align-middle">Rage</h1>
      </Link>
      <SignedIn>
        {/* Mount the UserButton component */}
        <div className="flex">
          { children }
          <UserButton />
        </div>
      </SignedIn>
      <SignedOut>
        { /* Signed out users get sign in button
        <SignInButton mode="modal">
          <Button>
            Sign in
          </Button>
        </SignInButton>
        */ }
      </SignedOut>
    </header>
  );
}

