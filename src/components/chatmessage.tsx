import { ChatEntry } from "@/lib/types";
import CopyToClipboard from "@/components/copytoclipboard";

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
//import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
//import { dark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface ChatMessageProps {
  name: string;
  chat: ChatEntry;
  apiResponse: string
}

const ChatMessage = (props: ChatMessageProps) => {
  return (
    <div className={"flex-col p-4 pt-3 pb-3 rounded-sm gap-1 text-sm group hover:bg-secondary bg-background hover:ring-1 ring-ring"}>
      <div className="grow flex justify-between">
        <p className={
          props.chat.role === "user" || props.chat.role === "tester" ? "text-slate-600 group-hover:text-gray-400 select-none" :
            "text-green-300 group-hover:text-green-200 select-none"}>{props.name}</p>
        <CopyToClipboard content={props.chat.content} />
      </div>

      <ReactMarkdown
        className="text-primary text-sm group-hover:text-gray-100"
        children={props.chat.content}
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
      />
      {props.chat?.apiResponse  &&  
      <ReactMarkdown
        className="text-primary text-sm max-w-full border-2 border-red-800 overflow-x-auto group-hover:text-gray-100"
        children={props.chat?.apiResponse}
        remarkPlugins={[remarkGfm]}
      />
    }
    </div>
  );
};

export default ChatMessage;
