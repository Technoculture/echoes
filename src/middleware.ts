import { authMiddleware } from "@clerk/nextjs";
import { NextRequest, NextResponse } from "next/server";
import { NextFetchEvent } from "next/server";
import { env } from "@/app/env.mjs";

// This is your original middleware
const clerkMiddleware = authMiddleware({
  // "/" will be accessible to all users
  publicRoutes: ["/"],
});

export async function middleware(req: NextRequest, event: NextFetchEvent) {
  console.log("got into middleware");
  // Check if the request is from Zeplo
  if (req.headers.get("x-zeplo-secret") === env.ZEPLO_SECRET) {
    // Handle the request without Clerk's authMiddleware
    console.log("got into if");
    // handleRequest(req, res);
  } else {
    console.log("got into else of middleware");
    // If not from Zeplo, use Clerk's authMiddleware
    // const nextReq = new NextRequest(req);
    // const nextFetchEvent = new NextFetchEvent(req);
    return clerkMiddleware(req, event);
  }
}

function handleRequest(req: NextRequest, res: NextResponse) {
  // If you have a specific endpoint function, you can call it here.
  // For example, if you have an endpoint function called 'endpointFunction':
  // endpointFunction(req, res);
  // If you don't have a specific function and just want to let the request meet the endpoint, you can do nothing here.
  // The request will continue to the next middleware or the route handler.
}

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
