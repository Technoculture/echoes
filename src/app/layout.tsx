import './globals.css';
import React from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from '@clerk/themes';
// import { Header } from "./main/page";

export const metadata = {
  title: 'Ragents',
  description: 'Research Agents',
  viewport: 'width=device-width, initial-scale=1.0'
};

export default function RootLayout ({ children }: { children: React.ReactNode; }) {
  return (
    <ClerkProvider 
        appearance={{
            baseTheme: dark,
            variables: {
                colorPrimary: "#00A700",
                borderRadius: "0px",
            }
        }}
    >
      <html lang="en">
        <head>
          <title>Ragents</title>
        </head>
        <body className="bg-gray-900">
          {/* <Header /> */ }
          { children }
        </body>
      </html>
    </ClerkProvider>
  );
}
