"use client";

import { useState } from "react";
import { Message } from "ai/react";
import { AgentStep } from "langchain/schema";

export function IntermediateStep(props: { message: Message }) {
  const parsedInput: AgentStep = JSON.parse(props.message.content);
  // const action = parsedInput.action;
  // const observation = parsedInput.observation;
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={`mx-auto bg-transparent text-xs rounded px-4 py-2 max-w-[80%] whitespace-pre-wrap flex flex-col cursor-pointer`}
    >
      <div
        className={`text-right mx-auto`}
        onClick={(e) => setExpanded(!expanded)}
      >
        <code className="mr-2 bg-slate-600 px-2 py-1 rounded">
          🛠️ <b>{parsedInput?.action.tool}</b>
        </code>
        <span className={expanded ? "hidden" : ""}>🔽</span>
        <span className={expanded ? "" : "hidden"}>🔼</span>
      </div>
      <div
        className={`overflow-hidden max-h-[0px] transition-[max-height] ease-in-out ${
          expanded ? "max-h-[360px]" : ""
        }`}
      >
        <div
          className={`bg-slate-600 rounded p-4 mt-1 max-w-0 ${
            expanded ? "max-w-full" : "transition-[max-width] delay-100"
          }`}
        >
          <code
            className={`opacity-0 max-h-[100px] overflow-auto transition ease-in-out delay-150 ${
              expanded ? "opacity-100" : ""
            }`}
          >
            Tool Input:
            <br></br>
            <br></br>
            {JSON.stringify(parsedInput?.action.toolInput)}
          </code>
        </div>
        <div
          className={`bg-slate-600 overflow-auto rounded p-4 mt-1 max-w-0 ${
            expanded ? "max-w-full" : "transition-[max-width] delay-100"
          }`}
        >
          <code
            className={`opacity-0 max-h-[260px] overflow-auto transition ease-in-out delay-150 ${
              expanded ? "opacity-100" : ""
            }`}
          >
            {parsedInput?.action ? parsedInput?.observation : "loading"}
          </code>
        </div>
      </div>
    </div>
  );
}
