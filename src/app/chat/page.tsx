import ChatMessage from '@/components/chatmessage';

//const fetchChat = async (id: string) => {}

export default function Page() {
  return (
    <div className='grow flex flex-col'>
    <ChatMessage chat={ { role: "user", content: "hello satyam" } } />
    </div>
  );
}
