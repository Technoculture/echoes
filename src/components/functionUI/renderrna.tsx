import React, { useEffect, useRef } from "react";
import * as fornac from "fornac";
import { Message } from "ai";

type Props = {
  chat: Message;
};

const RenderRNA = (props: Props) => {
  const divRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = divRef.current as Element;
    const Forna = new fornac.FornaContainer(element, {
      animation: false,
      zoomable: false,
      initialSize: [800, 600],
    });
    let structure = null;
    let sequence = null;
    if (props.chat.role === ("function" as const)) {
      console.log(JSON.parse(props.chat.content));
      console.log("parsable");
      let json = JSON.parse(props.chat.content);
      structure = json.structure;
      sequence = json.sequence;
    }
    let options = {
      structure: structure, //? structure : "..((..((...[)).(((..].))).))..",
      sequence: sequence, //? sequence : "AACGCUUCAUAUAAUCCUAAUGACCUAUAA",
    };
    Forna.addRNA(options.structure, options);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [divRef.current]);

  return (
    <div id="#forna" ref={divRef}>
      {props.chat.content}
    </div>
  );
};

export default RenderRNA;
