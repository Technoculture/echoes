"use client";
import { StopCircle } from "@phosphor-icons/react";
import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Drawer } from "vaul";
import { ReactMic, ReactMicStopEvent } from "react-mic";
import { Button } from "@/components/button";

interface Props {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  isRecording: boolean;
  setIsRecording: Dispatch<SetStateAction<boolean>>;
  submitAudio: (audioFile: File, shouldSubmit: boolean) => {};
}

const AudioDrawer = (props: Props) => {
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

  const startRecording = () => {
    props.setIsRecording(true);
  };

  useEffect(() => {
    if (window !== undefined) {
      startRecording();
    }
  }, []);

  console.log("isRecording", props.isOpen);
  const onData = (recordedBlob: Blob) => {
    console.log("chunk of real-time data is: ", recordedBlob);
  };

  const onStop = async (recordedBlob: ReactMicStopEvent) => {
    setAudioBlob(recordedBlob.blob);
    console.log(recordedBlob.option);
    const audioFile = new File([recordedBlob.blob], "music.wav", {
      type: recordedBlob.blob.type,
    });
    await props.submitAudio(audioFile, true);
  };

  return (
    <Drawer.Root
      shouldScaleBackground
      // dismissible
      open={props.isOpen}
      onOpenChange={() => {
        props.setIsRecording((prev) => false);
        console.log("executing");
        props.setIsOpen(false);
      }}
    >
      {/* <Drawer.Trigger asChild>
        <button>Open Drawer</button>
      </Drawer.Trigger> */}
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40" />
        <Drawer.Content className="bg-zinc-100 flex flex-col rounded-t-[10px] h-[56%] mt-24 fixed bottom-0 left-0 right-0">
          <div className="p-4  bg-[#494cf7] w-[100%] h-[100%] rounded-t-[10px] border-2 border-red-900 flex flex-col justify-center items-center">
            {/* <div> */}
            <div className="relative w-32 h-32 rounded-full bg-[#afb8c1]"></div>
            <Button
              variant={"ghost"}
              onClick={() => props.setIsRecording((prev) => !prev)}
              className="flex items-center text-2xl"
            >
              <StopCircle size={36} weight="bold" />
              Tap to {props.isRecording ? " stop recording" : "record again"}
            </Button>
            {window !== undefined && (
              <ReactMic
                mimeType="audio/wav"
                visualSetting="frequencyBars"
                record={props.isRecording}
                className="hidden"
                onStop={onStop}
                onData={onData}
                strokeColor="#000000"
                backgroundColor="transparent"
              />
            )}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
};

export default AudioDrawer;
