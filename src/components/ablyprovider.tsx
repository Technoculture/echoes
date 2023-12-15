"use client";
import * as Ably from "ably";
import { AblyProvider } from "ably/react";
import { ReactNode } from "react";

export const AblyChannelProvider = ({
  children,
  clientId,
}: {
  children: ReactNode;
  clientId: string;
}) => {
  const client = new Ably.Realtime.Promise({
    key: process.env.NEXT_PUBLIC_ABLY_API_KEY,
    clientId: clientId,
    recover: (lastConnectionDetails, cb) => {
      console.log("last connection details", lastConnectionDetails);
      cb(true);
    },
  });
  return <AblyProvider client={client}>{children}</AblyProvider>;
};
