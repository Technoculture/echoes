'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Inter } from 'next/font/google';
import logo from '@/assets/logo.png';

const inter = Inter({ subsets: ['latin'] });

import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton
} from "@clerk/nextjs";

export default function Header() {
  return (
    <header className='flex justify-between p-5'>
      <Link href="/" className='gap-2 flex items-center cursor-pointer h-[32px]'>
        <Image src={logo} alt="logo" className='w-6 h-6 border-gray-700 border-2' />
        <h1 className="text-gray-200 align-middle">Rage</h1>
      </Link>
      <SignedIn>
        {/* Mount the UserButton component */}
        <UserButton />
      </SignedIn>
      <SignedOut>
        {/* Signed out users get sign in button */}
        <SignInButton />
      </SignedOut>
    </header>
  );
}

