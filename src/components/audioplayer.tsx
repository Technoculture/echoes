"use client";
import React, { useRef } from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuItem,
  DropdownMenuLabel,
} from "@/components/ui/dropdownmeu";
import { useStore } from "@/store";
import { ChevronDown } from "lucide-react";
import "../assets/audio.css";

type Props = {};

const AudioPlayer = (props: Props) => {
  const {
    audioSrc,
    currentTrackIndex,
    isPlaying,
    pause,
    play,
    playNextTrack,
    playTrack,
    queueTracks,
    reset,
    setAudioSrc,
    tracks,
  } = useStore();
  const audioRef = useRef<HTMLAudioElement>(null);
  const currentTrack =
    currentTrackIndex !== null ? tracks[currentTrackIndex] : null;
  // console.log("currentTrack", currentTrack)

  const handlePlay = () => {
    if (currentTrackIndex === null) {
      console.log("no current track");
      playTrack(0);
    } else {
      play();
      if (audioRef.current) {
        if (audioRef.current.paused) {
          audioRef.current.play();
        }
      }
    }
  };
  const handleReset = () => {
    reset();
    if (audioRef.current) {
      if (!audioRef.current.paused) {
        audioRef.current.pause();
      }
    }
  };

  const handlePause = () => {
    if (audioRef.current) {
      if (!audioRef.current.paused) {
        audioRef.current.pause();
      }
    }
    console.log("pause", isPlaying);
    pause();
    console.log("pause", isPlaying);
  };

  const handleEnded = () => {
    console.log("ended the track");
    playNextTrack();
  };

  const handleTrackClick = (index: number) => {
    console.log("track clicked", index);
    playTrack(index);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 outline-none">
        {/* {currentTrack ? ( */}
        <audio
          ref={audioRef}
          src={currentTrack ? currentTrack?.src : undefined}
          onEnded={handleEnded}
          autoPlay={isPlaying}
          controls
          controlsList="nodownload noplaybackrate"
          className="max-h-[60px]"
        ></audio>
        {/* ) : null} */}
        Music
        <ChevronDown />
      </DropdownMenuTrigger>
      <DropdownMenuContent className=" grid grid-cols-2 bg-background max-w-[700px]">
        <div>
          <DropdownMenuLabel>Title</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {tracks.map((track: any, index) => (
            <DropdownMenuItem
              key={track.id}
              onClick={() => handleTrackClick(index)}
            >
              {track.title.split(" ").slice(0, 5).join(" ")}
            </DropdownMenuItem>
          ))}
        </div>
        <div className="flex flex-col gap-4">
          <button onClick={handlePlay}>Play</button>
          <button onClick={handlePause}>Pause</button>
          <button onClick={handleReset}>Reset</button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AudioPlayer;
