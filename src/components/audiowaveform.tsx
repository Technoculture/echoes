import React, { Dispatch, SetStateAction, useEffect } from "react";
import { ReactMic, ReactMicStopEvent } from "react-mic";
import { Button } from "@/components/button";
import { motion } from "framer-motion";
import { StopCircle } from "@phosphor-icons/react";
import { useTheme } from "next-themes";

type Props = {
  isRecording: boolean;
  setIsRecording: Dispatch<SetStateAction<boolean>>;
  handleAudio: (audioFile: File) => void;
};

const AudioWaveForm = (props: Props) => {
  const { theme, setTheme } = useTheme();

  const startRecording = () => {
    props.setIsRecording(true);
  };

  useEffect(() => {
    if (window !== undefined)
    {
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
      layout
      initial={ { height: 0, opacity: 0 } }
      animate={ {
        height: "100%",
        opacity: 1,
        transition: { duration: 1, type: "spring" },
      } }
      exit={ { height: 0, opacity: 0, transition: { duration: 1 } } }
      className="flex w-full gap-2 p-2"
    >
      <div className="flex flex-grow">
        <ReactMic
          visualSetting="frequencyBars"
          className="min-w-full max-w-full rounded-sm"
          mimeType="audio/wav"
          record={ props.isRecording }
          onStop={ onStop }
          onData={ onData }
          strokeColor={ theme === 'dark' ? "#cbd5e1" : "#18181b" }
          backgroundColor={ theme === 'dark' ? "#18181b" : "#f4f4f5" }
          echoCancellation={ true }
          autoGainControl={ true }
          noiseSuppression={ true }
        />
      </div>
      <motion.div
        initial={ { x: -20, y: -25, opacity: 0 } }
        animate={ { x: 0, y: 0, opacity: 1, transition: { duration: 0.5 } } }
        exit={ { x: -20, y: -25, opacity: 0, transition: { duration: 0.5 } } }
      >
        <Button
          type="button"
          size="icon"
          variant="outline"
          onClick={ () => props.setIsRecording(false) }
        >
          <StopCircle className="h-4 w-4 text-destructive" />
        </Button>
      </motion.div>
    </motion.div>
  );
};

export default AudioWaveForm;
