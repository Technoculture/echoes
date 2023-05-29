'use client';

import Image from 'next/image';
import { Inter } from 'next/font/google';
import Div100vh from 'react-div-100vh';
import logo from '../../logo.png';
import { env } from './env.mjs';

const inter = Inter({ subsets: ['latin'] });

import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton
} from "@clerk/nextjs";

export default function Home() {
  return (
    //<div className='bg-gray-900 py-6 px-4 flex flex-col'>
    <Div100vh className='bg-gray-900 py-6 px-4 flex flex-col'>
      <header className='flex justify-between p-1'>
        <div className='gap-2 flex'>
          <Image src={logo} className='flex-none w-6 h-6 mb-6 border-gray-700 border-2' />
          <h1 className="text-gray-200">Ragents</h1>
        </div>
        <SignedIn>

          {/* Mount the UserButton component */}
          <UserButton />
        </SignedIn>
        <SignedOut>
          {/* Signed out users get sign in button */}
          <SignInButton />
        </SignedOut>
      </header>
    </Div100vh>
    //</div>
  );
}

