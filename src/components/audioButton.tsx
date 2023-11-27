"use client";
import React, { useEffect } from "react";
import { Button, ButtonProps } from "./button";
import useStore from "@/store";
import { CircleNotch, Play } from "@phosphor-icons/react";
import { ChatEntry } from "@/lib/types";
import { Pause } from "lucide-react";
import getBlobDuration from "get-blob-duration";
import { calculateTime } from "@/utils/helpers";
interface Props extends ButtonProps {
  id: string;
  description: string;
  chatTitle: string;
  imageUrl: string | null;
  chatId: string;
  orgId: string;
  audio: string | null;
  setMessages?: (messages: any) => void;
  messageIndex?: number; // index of the message in the chat (not required for summarization)
  summarize?: boolean;
  messages?: ChatEntry[];
}

const AudioButton = React.forwardRef<HTMLButtonElement, Props>(
  (
    {
      summarize = false,
      id,
      description,
      audio,
      chatId,
      chatTitle,
      imageUrl,
      orgId,
      setMessages,
      messageIndex,
      messages,
      children,
      ...props
    }: Props,
    ref
  ) => {
    const [audioSrc, setAudioSrc] = React.useState<string>(audio || "");
    const [duration, setDuration] = React.useState<string>("");

    const store = useStore();
    const [isFetchingAudioBuffer, setIsFetchingAudioBuffer] =
      React.useState<boolean>(false);

    const textToSpeech = async (id: string) => {
      if (audioSrc !== "") {
        // works for both summarization and chatMessage
        const length = store.tracks.length;
        const track = {
          id: id,
          src: audioSrc,
          title: chatTitle,
          imageUrl: imageUrl,
          description: description,
        };
        store.queueTracks(track);
        store.playTrackById(id);
        return;
      }
      if (!summarize && setMessages) {
        const text = description;
        setIsFetchingAudioBuffer(true);
        try {
          const res = await fetch("/api/tts", {
            method: "post",
            body: JSON.stringify({
              text: text,
              messageId: id,
              index: messageIndex,
              orgId: orgId,
              chatId: chatId,
              voice: "en-US",
            }),
          });
          const data = await res.json();
          const url = data.audioUrl;
          setMessages(data.updatedMessages);
          store.setAudioSrc(url);
          const length = store.tracks.length;
          store.queueTracks({
            id: id,
            src: url,
            title: chatTitle,
            imageUrl: imageUrl,
            description: description,
          });
          store.playTrack(length);
          setAudioSrc(url);
        } catch (err) {
          console.log(err);
        }
        setIsFetchingAudioBuffer(false);
      } else {
        // summarize
        try {
          setIsFetchingAudioBuffer(true);
          const res = await fetch("/api/tts?summariz=true", {
            method: "POST",
            body: JSON.stringify({
              messages: messages,
              orgId: orgId,
              chatId: chatId,
              voice: "en-US",
            }),
          });

          const data = await res.json();
          const url = data.audioUrl;
          const length = store.tracks.length;
          store.queueTracks({
            id: id,
            src: url,
            title: chatTitle,
            imageUrl: imageUrl,
            description: description,
          });
          store.playTrack(length);
          setAudioSrc(url);
          setIsFetchingAudioBuffer(false);
        } catch (err) {
          console.log(err);
        }
      }
    };

    useEffect(() => {
      if (audio) {
        const duration = getBlobDuration(audio as string).then((duration) => {
          console.log("duration", duration);
          setDuration(calculateTime(duration));
        });
      }
    }, []);

    const currentTrack = store.currentTrackId;

    return (
      <Button
        ref={ref}
        {...props}
        onClick={(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
          e.stopPropagation();
          textToSpeech(id);
        }}
      >
        {isFetchingAudioBuffer ? (
          <>
            Generating Audio{" "}
            <CircleNotch className="ml-2 animate-spin h-4 w-4" />
          </>
        ) : currentTrack === id && store.isPlaying ? (
          <>
            Pause <Pause className="ml-2 h-4 w-4" />
          </>
        ) : audioSrc ? (
          <>
            {" "}
            Speak ({duration}) <Play className="ml-2 h-4 w-4" />
          </>
        ) : (
          <>
            {" "}
            Speak <Play className="ml-2 h-4 w-4" />
          </>
        )}
      </Button>
    );
  }
);

AudioButton.displayName = "AudioButton";

export default AudioButton;
