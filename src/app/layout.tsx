import './globals.css';
import React from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from '@clerk/themes';

import { Inter } from 'next/font/google';
const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Echo',
  description: 'Seek using Research Agents',
  viewport: "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no",

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
        className={`${inter.className} dark h-full scroll-smooth antialiased`}// TODO: NEEDED? 
      >
        <head>
          <link rel="icon" href="/favicon.ico" sizes="any" />
          <link rel="apple-touch-icon" href="/apple-touch-icon.png" type="image/png" sizes="128x128" />
          <title>Echo</title>
        </head>
        <body className="bg-background">
          <div className='flex-col flex-grow'>
            {children}
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}
