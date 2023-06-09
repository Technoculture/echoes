import { redirect } from 'next/navigation';

export default function Page({ params }: { params: { uid: string } }) {
  let new_chat_id = 1010; // TODO: mock new chat id
  let chat_url = `/${params.uid}/${new_chat_id}`;

  // console.log('redirecting to', chat_url);

  redirect(chat_url);
}

