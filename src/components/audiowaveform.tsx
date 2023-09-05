import React, { Dispatch, SetStateAction, useEffect } from "react";
import { ReactMic, ReactMicStopEvent } from "react-mic";
import { Button } from "@/components/button";
import { motion } from "framer-motion";
import { StopCircle } from "@phosphor-icons/react";

type Props = {
  isRecording: boolean;
  setIsRecording: Dispatch<SetStateAction<boolean>>;
  handleAudio: (audioFile: File) => void;
};

const AudioWaveForm = (props: Props) => {
  const startRecording = () => {
    props.setIsRecording(true);
  };

  useEffect(() => {
    if (window !== undefined) {
      startRecording();
    }
    const timeout = setTimeout(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    }, 100);

    return () => clearTimeout(timeout);
  }, []);

  const onData = (recordedBlob: Blob) => {
    // console.log("isRecording", props.isOpen);
    console.log("chunk of real-time data is: ", recordedBlob);
  };

  const onStop = async (recordedBlob: ReactMicStopEvent) => {
    console.log(recordedBlob.option);
    const audioFile = new File([recordedBlob.blob], "music.wav", {
      type: recordedBlob.blob.type,
    });
    // setAudioBlob(recordedBlob);
    await props.handleAudio(audioFile);
  };

  return (
    <motion.div
      initial={{ y: 300, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 300, opacity: 0 }}
      className="box-border flex justify-between p-2 gap-2 w-full"
    >
      <ReactMic
        visualSetting="frequencyBars"
        className="min-w-[90%] rounded-sm"
        mimeType="audio/wav"
        record={props.isRecording}
        onStop={onStop}
        onData={onData}
        strokeColor="#cbd5e1"
        backgroundColor="rgb(15,23,42)"
        echoCancellation={true}
        autoGainControl={true}
        noiseSuppression={true}
      />
      <Button
        type="button"
        variant={"outline"}
        onClick={() => props.setIsRecording(false)}
      >
        <StopCircle className="h-4 w-4 fill-current" />
      </Button>
    </motion.div>
  );
};

export default AudioWaveForm;
