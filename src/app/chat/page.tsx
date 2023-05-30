import ChatMessage from '@/components/chatmessage';

export default function Page() {
  return (
    <div>
    <ChatMessage chat={ { role: "user", content: "hello satyam" } } />
    </div>
  );
}
