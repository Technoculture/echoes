'use client';

import ChatMessage from '@/components/chatmessage';
import { ChatLog, ChatEntry } from '@/lib/types';
import InputBar from "@/components/inputBar";
import { useState } from 'react';
import { useRouter } from 'next/navigation'

interface ChatProps {
  uid: string;
  chat: ChatLog;
  chatId: string;
  pushNewChat: (chat: ChatLog) => Promise<string>;
}

export default function Chat(props: ChatProps) {
  // console.log(props.chat)
  const [messages, setMessages] = useState<ChatEntry[]>(props.chat.log);
  const [streamingData, setStreamingData] = useState('')
  const router = useRouter()

  //console.log('messages', messages);

  const send = async (message: string) => {
    // changing state optimistically
    let newMessages = [
      ...messages, 
      { "role": "user", "content": message } as ChatEntry
    ];
    setMessages(newMessages);
    
    const id: string = await props.pushNewChat({ "log": newMessages });
    if (id !== "") {
      console.log('pushed new chat with id', id);
      router.push(`/${props.uid}/chat/${id}`);
    }
    try{
      const chat_id = id !== '' ? id : props.chatId
      const response = await fetch(`/api/chatmodel/${chat_id}`, {
        method: 'POST',
        // credentials: 'include',
      })
      if(response.body){

        const reader = response?.body.getReader();
        
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) {
            break;
          }
          
          const text = new TextDecoder().decode(value);
          console.log("textChunck" , text, "\n")
          setStreamingData((prevData) => prevData + text);
        }
      }
  } catch(err) {
    console.log("something went wrong")
  }
    //   .then((response) => {
    //     console.log(response)
    //     const decoder = new TextDecoder();
    //     const reader = response?.body?.getReader();
    //     // // read() returns a promise that resolves when a value has been received
    //     // reader?.read().then(function pump({ done, value }): any {
    //     //   if (done) {
    //     //     // Do something with last chunk of data then exit reader
    //     //     return;
    //     //   }
    //     //   // Otherwise do something here to process current chunk
    //     //     console.log("dedoding", decoder.decode(value))
    //     //     setApiRes(prev => prev + decoder.decode(value))
    //     //   // Read some more, and call this function again
    //     //   return reader.read().then(pump);
    //     // });
    //   })
    //   // console.log("data",data)
    // } catch(err) {
    //   console.log("err", err)
    // }
  }

  return (
    <div className='grid grig-cols-1 gap-1'>
      {
        messages.map((entry: ChatEntry, index: number) => {
          if (entry.role !== "system") {
            return (
              <ChatMessage
                apiResponse={streamingData}
                name={props.uid}
                chat={entry}
                key={index}
              />);
          }
        })
      }
      <InputBar
        onSubmit={(msg) => send(msg)}
      />
    </div>
  );
}

