import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype/lib";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { NormalComponents } from "react-markdown/lib/complex-types";
import { SpecialComponents } from "react-markdown/lib/ast-to-react";
import { PluggableList } from "react-markdown/lib/react-markdown";
import { Badge } from "@/components/badge";
import { ScrollArea } from "@/components/scrollarea";
import { MessageRole } from "@/lib/types";

type Props = {
  content: string;
  role: MessageRole;
};

interface Components
  extends Partial<
    Omit<NormalComponents, keyof SpecialComponents> & SpecialComponents
  > {}

const RenderMarkdown = (props: Props) => {
  return (
    <div>
      <ReactMarkdown
        className={`text-primary text-sm ${
          props.role === "user"
            ? "group-hover:text-gray-100"
            : "max-w-full p-4 overflow-x-auto"
        } `}
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[remarkRehype] as PluggableList}
        components={components}
      >
        {props.content}
      </ReactMarkdown>
    </div>
  );
};

export default RenderMarkdown;

const components: Components = {
  h1: ({ children, node, level, ...props }) => {
    return (
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
        {children}
      </h1>
    );
  },
  h2: ({ children, node, level, ...props }) => {
    return (
      <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0">
        {children}
      </h2>
    );
  },
  h3: ({ children, node, level, ...props }) => {
    return (
      <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
        {children}
      </h3>
    );
  },
  h4: ({ children, node, level, ...props }) => {
    return (
      <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
        {children}
      </h4>
    );
  },
  p: ({ children, node, ...props }) => {
    if (children.length === 1 && children.toString().includes("#")) {
      const str = children.toString();
      let strChunks = str.split(" ");
      return (
        <p className="leading-normal [&:not(:first-child)]:mt-6">
          {strChunks.map((chunk) =>
            chunk.match(/([#])\w+/g) ? (
              <Badge key={chunk}>{chunk.slice(1)}</Badge>
            ) : (
              <span key={chunk}>{chunk}</span>
            ),
          )}
        </p>
      );
    }
    return (
      <p className="leading-normal [&:not(:first-child)]:my-4">{children}</p>
    );
  },
  blockquote: ({ children, node, ...props }) => {
    return (
      <blockquote className="mt-6 border-l-2 pl-6 italic">
        {children}
      </blockquote>
    );
  },
  ul: ({ children, node, ...props }) => {
    return <ul className="my-6 ml-6 list-disc [&>li]:mt-2">{children}</ul>;
  },
  ol: ({ children, node, ...props }) => {
    return <ol className="my-6 ml-6 list-decimal [&>li]:mt-2">{children}</ol>;
  },
  code({ node, inline, className, style, children, ...props }) {
    const match = /language-(\w+)/.exec(className || "");
    return (
      <ScrollArea className="w-[90vw]">
        {!inline && match ? (
          <div style={dark}>
            <SyntaxHighlighter
              style={atomDark}
              language={match[1]}
              PreTag="div"
              showLineNumbers
              {...props}
            >
              {String(children).replace(/\n$/, "")}
            </SyntaxHighlighter>
          </div>
        ) : (
          <code className={className} {...props}>
            {children}
          </code>
        )}
      </ScrollArea>
    );
  },
  small: ({ children }) => {
    return (
      <small className="text-sm font-medium leading-none">{children}</small>
    );
  },
  table: ({ children }) => {
    return (
      <ScrollArea className="w-[90vw]">
        <table className="w-full">{children}</table>
      </ScrollArea>
    );
  },
  tr: ({ children }) => {
    return <tr className="m-0 border-t p-0 even:bg-muted">{children}</tr>;
  },
  th: ({ children }) => {
    return (
      <th className="border px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right">
        {children}
      </th>
    );
  },
  td: ({ children }) => {
    return (
      <td className="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right">
        {children}
      </td>
    );
  },
  a: ({ children, href }) => {
    return (
      <a
        href={href}
        target="_blank"
        className="underline underline-offset-4 hover:text-primary"
      >
        {children}
      </a>
    );
  },
  b: ({ children }) => {
    return <b className="font-bold">{children}</b>;
  },
  i: ({ children }) => {
    return <i className="italic">{children}</i>;
  },
};