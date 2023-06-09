import './globals.css';
import React from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from '@clerk/themes';
import Header from "@/components/header";

import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Rage',
  description: 'Research Agents',
  viewport: 'width=device-width, initial-scale=1.0'
};

export default function RootLayout({ children }:
  { children: React.ReactNode; }) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: "#00A700",
          borderRadius: "0px",
        },
      }}
    >
      <html lang="en"
        className={`${inter.className} h-full scroll-smooth antialiased`}// TODO: NEEDED? 
      >
        <head>
          <title>Rage</title>
        </head>
        <body className="bg-linear-50">
          <div className='flex-col flex-grow'>
            {children}
          </div>)
        </body>
      </html>
    </ClerkProvider>
  );
}
