import ChatMessage from '@/components/chatmessage';
import { ChatLog, ChatEntry } from '@/types/types';

interface ChatProps {
  chat: ChatLog;
}

export default function Chat(props: ChatProps) {
  const { chat } = props;

  return (
    <div className='flex-col flex-grow '>
      {
        chat.log.map((entry: ChatEntry, index: number) => {
          if (entry.role !== "system") {
            return (<ChatMessage
              chat={entry}
              key={index}
            />);
          }
        })
      }
    </div>
  );
}
