import { clerkClient } from "@clerk/nextjs";
import { NextRequest, NextResponse } from "next/server";
export const maxDuration = 30;
export async function POST(request: NextRequest) {
  const body = await request.json();
  const ids = body?.ids;

  const users = await clerkClient.users.getUserList({ userId: ids });
  const requiredData = users.map((user) => ({
    id: user.id,
    img: user.imageUrl,
  }));

  return new NextResponse(JSON.stringify({ users: requiredData }));
}
