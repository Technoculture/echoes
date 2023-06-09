import { redirect } from 'next/navigation';
import { db } from '@/db';
import { currentUser } from '@clerk/nextjs';
import { chats, NewChat } from '@/db/schema';

export default async function Page({ params }: { params: { uid: string } }) {
  const user = await currentUser();

  if (!params.uid || !user || user.username !== params.uid) {
    // - userid in url is not undefined
    // - user is not logged in
    // - user is the not the same as the one in the url
    console.log('redirecting to "/"');
    redirect("/");
  }

  const { insertId } = await db.insert(chats).values({
    user_id: params.uid
  });
  console.log('insertId', insertId);

  let chat_url = `/${user.username}/chat/${insertId}`;
  console.log(`redirecting to "${chat_url}"`);
  redirect(chat_url);
}

