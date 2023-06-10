import Chat from '@/components/chat';
import { ChatLog } from '@/types/types';
import { currentUser } from '@clerk/nextjs';
import { db } from '@/db';
import { redirect } from 'next/navigation';
import { Chat as ChatSchema, chats } from '@/db/schema';
import { eq } from 'drizzle-orm';
//import {
//  Card,
//  CardContent,
//  CardDescription,
//  CardFooter,
//  CardHeader,
//  CardTitle,
//} from "@/components/card";
import { Button } from "@/components/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function Page({ params }: { params: { uid: string, chatid: string } }) {
  // console.log(params);
  
  const user = await currentUser();
  if (!params.uid || !params.chatid || !user || user.username !== params.uid) {
    // - userid in url is not undefined
    // - chatid in url is not undefined
    // - user is logged in
    // - user is the same as the one in the url
    console.log('redirecting to "/"');
    redirect("/");
  }

  let chatlog: ChatLog = { "log": [] };
  if (params.chatid !== 'new') {
    // Fetch the chat if it exists and is not "new"
    let fetchedChat: ChatSchema[] = await db.select()
      .from(chats)
      .where(eq(chats.id, Number(params.chatid)))
      .limit(1);
    // console.log('fetchedChat', fetchedChat[0]);

    const msg = fetchedChat[0]?.messages;
    // console.log(msg)
    if (fetchedChat.length === 1 && msg) {
      chatlog = JSON.parse(msg as string) as ChatLog;
      //console.debug('chatlog', chatlog);
    }
  }

  const pushChat = async (chat_entries: ChatLog) => {
    'use server';

    if (params.chatid === 'new') {
      // create new chat
      const { insertId } = await db.insert(chats).values({
        "user_id": params.uid,
        "messages": JSON.stringify(chat_entries),
      });
      console.debug('New chat created: ', insertId);

      return insertId;
    } else {
      // update existing chat
      await db.update(chats)
        .set({ messages: JSON.stringify(chat_entries) })
        .where(eq(chats.id, Number(params.chatid)));

      return "";
    }
  }

  //const deleteChat = async (chatid: number) => {
  //  'use server';
  //  await db.delete(chats).where(eq(chats.id, chatid));
  //  return true;
  //}

  return (
    <div className='flex-col h-full justify-between'>
      <div className="flex space-between mb-2">
        <Button asChild><Link href={`/${params.uid}`}><ArrowLeft className="mr-2 h-4 w-4" />Back</Link></Button>
        <div className="grow" />
        { /* <Button variant="destructive"><Trash2 className="mr-2 h-4 w-4" />Delete Chat</Button> */}
      </div>
      <div>
        { /*
          <Card className=" rounded-none">
            <CardHeader>
              <CardTitle>Objective</CardTitle>
              <CardDescription>Card Description</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Card Content</p>
              <CardDescription>Card Description</CardDescription>
            </CardContent>
            <CardFooter>
            </CardFooter>
          </Card>
          */ }
      </div>
      <Chat
        chat={chatlog}
        pushNewChat={pushChat}
        uid={params.uid}
      />
    </div>
  );
}

