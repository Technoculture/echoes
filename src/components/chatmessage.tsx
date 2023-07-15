import CopyToClipboard from "@/components/copytoclipboard";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Message } from "ai";
//import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
//import { dark } from 'react-syntax-highlighter/dist/esm/styles/prism';

// totally Message with an optional createdBy property
interface OrganizationChatMessage extends Message {
  createdBy?: string;
}

interface ChatMessageProps {
  name: string;
  chat: OrganizationChatMessage;
  uid: string
}

const ChatMessage = (props: ChatMessageProps) => {
  let userName = '';
  if(props?.chat.name){
    const [name, id] = props.chat.name.split(',');
    if(id === props.uid){
      userName = 'You';
    } else {
      userName = name
    }
  } else{
    if(props.chat.role === 'user'){
      userName = 'You'
    } else {
      userName = props.chat.role
    }
  }

  return (
    <div
      className={
        "flex-col p-4 pt-3 pb-3 rounded-sm gap-1 text-sm group hover:bg-secondary bg-background hover:ring-1 ring-ring"
      }
    >
      <div className="grow flex justify-between">
        <p
          className={
            props.chat.role === "user"
              ? "text-slate-600 group-hover:text-gray-400 select-none"
              : "text-green-300 group-hover:text-green-200 select-none"
          }
        >
          {userName}
        </p>
        <CopyToClipboard content={props.chat.content} />
      </div>
      {props.chat.role === "user" ? (
        <ReactMarkdown
          className="text-primary text-sm group-hover:text-gray-100"
          remarkPlugins={[remarkGfm]}
          //components={{
          //  code({ node, inline, className, children, ...props }) {
          //    const match = /language-(\w+)/.exec(className || '');
          //    return !inline && match ? (
          //      <SyntaxHighlighter
          //        children={String(children).replace(/\n$/, '')}
          //        style={dark}
          //        language={match[1]}
          //        PreTag="div"
          //        showLineNumbers
          //        {...props}
          //      />
          //    ) : (
          //      <code className={className} {...props}>
          //        {children}
          //      </code>
          //    );
          //  }
          //}}
        >
          {props.chat.content}
        </ReactMarkdown>
      ) : (
        <ReactMarkdown
          className="text-primary text-sm max-w-full p-4 overflow-x-auto group-hover:text-gray-100"
          remarkPlugins={[remarkGfm]}
        >
          {props.chat.content}
        </ReactMarkdown>
      )}
    </div>
  );
};

export default ChatMessage;
