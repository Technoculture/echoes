import "./globals.css";
import React from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

import { Inter } from "next/font/google";
import Providers from "@/app/queryProvider";
const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Echoes",
  description: "Seek using Research Agents",
  manifest: "/manifest.json",
  viewport:
    "minimum-scale=1.0, initial-scale=1.0, width=device-width, shrink-to-fit=no, user-scalable=no, viewport-fit=cover"
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
      <html
        lang="en"
        className={`${inter.className} dark h-full scroll-smooth antialiased`}
      >
        <head>
          <link rel="icon" href="/favicon.ico" sizes="any" />
          <link
            rel="apple-touch-icon"
            href="/apple-touch-icon.png"
            type="image/png"
            sizes="128x128"
          />
          <meta name="application-name" content="Echoes" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="default" />
          <meta name="apple-mobile-web-app-title" content="Echoes" />
          <meta name="description" content="Collaborative Platform for Researchers. Designed for Humans and AIs." />
          <meta name="format-detection" content="telephone=no" />
          <meta name="mobile-web-app-capable" content="yes" />
          <meta name="msapplication-config" content="/icons/browserconfig.xml" />
          <meta name="msapplication-TileColor" content="#2B5797" />
          <meta name="msapplication-tap-highlight" content="no" />
          <meta name="theme-color" content="#000000" />

          <link rel="apple-touch-icon" href="/icons/touch-icon-iphone.png" />
          <link rel="apple-touch-icon" sizes="152x152" href="/icons/touch-icon-ipad.png" />
          <link rel="apple-touch-icon" sizes="180x180" href="/icons/touch-icon-iphone-retina.png" />
          <link rel="apple-touch-icon" sizes="167x167" href="/icons/touch-icon-ipad-retina.png" />

          <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
          <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />

          <link rel="manifest" href="/manifest.json" />
          <link rel="mask-icon" href="/icons/safari-pinned-tab.svg" color="#5bbad5" />
          <link rel="shortcut icon" href="/favicon.ico" />
          <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500" />

          <meta name="twitter:card" content="summary" />
          <meta name="twitter:url" content="https://echoes.team" />
          <meta name="twitter:title" content="Echoes" />
          <meta name="twitter:description" content="Collaborative Platform for Researchers. Designed for Humans and AIs." />
          <meta name="twitter:image" content="https://echoes.team/android-chrome-192x192.png" />
          <meta name="twitter:creator" content="@satiyum" />
          <meta property="og:type" content="website" />
          <meta property="og:title" content="Echoes" />
          <meta property="og:description" content="Collaborative Platform for Researchers. Designed for Humans and AIs." />
          <meta property="og:site_name" content="Echoes" />
          <meta property="og:url" content="https://echoes.team" />
          <meta property="og:image" content="https://echoes.team/apple-touch-icon.png" />

          <title>Echoes</title>
        </head>
        <body className="bg-background">
          <Providers>
            <div className="flex-col flex-grow">{children}</div>
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
