"use client";
import React, { useEffect, useRef, useState } from "react";

import { useStore } from "@/store";
import { Pause, Play, X } from "lucide-react";
import { Slider } from "./slider";
import { Button } from "./button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/tooltip";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigationmenu";
import Image from "next/image";
import logo from "@/assets/logo.png";

type Props = {};

const AudioPlayer = (props: Props) => {
  const {
    currentTrackId,
    isPlaying,
    pause,
    play,
    playNextTrack,
    playTrack,
    queueTracks,
    removeFromQueue,
    reset,
    tracks,
  } = useStore();
  const audioRef = useRef<HTMLAudioElement>(null);
  const currentTrack =
    currentTrackId !== null
      ? tracks.find((t) => t.id === currentTrackId)
      : null;
  // console.log("currentTrack", currentTrack)

  useEffect(() => {
    if (currentTrack) {
      animationRef.current = requestAnimationFrame(whilePlaying);
    }
  }, [currentTrack]);

  const handlePlay = () => {
    if (currentTrackId === null) {
      console.log("no current track");
      playTrack(0);
    } else {
      play();
      if (audioRef.current) {
        audioRef.current.play();
        if (audioRef.current.paused) {
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
    animationRef.current = requestAnimationFrame(whilePlaying);
  };

  // from pla
  // references
  const audioPlayer = useRef<HTMLAudioElement>(null); // reference our audio component
  const progressBar = useRef<HTMLSpanElement>(null); // reference our progress bar
  const animationRef = useRef<number>(); // reference the animation

  const [duration, setDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [sliderValue, setSliderValue] = useState<number>(0);
  const [sliderMax, setSliderMax] = useState<number>(0);

  const calculateTime = (secs: number) => {
    const minutes = Math.floor(secs / 60);
    const returnedMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
    const seconds = Math.floor(secs % 60);
    const returnedSeconds = seconds < 10 ? `0${seconds}` : `${seconds}`;
    return `${returnedMinutes}:${returnedSeconds}`;
  };

  const togglePlayPause = () => {
    const prevValue = isPlaying;
    // setIsPlaying(!prevValue);
    if (audioRef.current) {
      if (!prevValue) {
        handlePlay();
        // audioRef.current.play();
        animationRef.current = requestAnimationFrame(whilePlaying);
      } else {
        // audioRef.current.pause();
        handlePause();
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      }
    }
  };

  const whilePlaying = () => {
    if (audioRef && audioRef.current) {
      setSliderValue(audioRef.current.currentTime);
      setCurrentTime(audioRef.current.currentTime);
      animationRef.current = requestAnimationFrame(whilePlaying);
    }
  };

  const changeRange = (sldrval?: number) => {
    if (audioRef && audioRef.current) {
      const val = sldrval ? sldrval : sliderValue;
      audioRef.current.currentTime = val;
      setCurrentTime(val);
    }
  };

  const backThirty = () => {
    if (progressBar.current) {
      setSliderValue((prev) => prev - 30);
      changeRange(sliderValue - 30);
    }
  };

  const forwardThirty = () => {
    if (progressBar.current) {
      setSliderValue((prev) => prev + 30);
      changeRange(sliderValue + 30);
    }
  };

  const handleAudioEnded = () => {
    if (animationRef.current) {
      // setIsPlaying(false);
      setCurrentTime(0);
      setSliderValue(0);
      const val = playNextTrack();
      if (!val) cancelAnimationFrame(animationRef.current);
    }
  };

  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>
            <audio
              ref={audioRef}
              src={currentTrack ? currentTrack?.src : undefined}
              preload="metadata"
              autoPlay={isPlaying}
              onLoadedData={() => {
                if (audioRef.current) {
                  const seconds = Math.floor(audioRef.current.duration);
                  setDuration(seconds);
                  setSliderMax(seconds);
                }
              }}
              onEnded={handleAudioEnded}
            ></audio>
            Playlist
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
              <li className="sm:row-span-3 relative ">
                <div>
                  <div className="flex gap-4 flex-grow">
                    <div className="">{calculateTime(currentTime)}</div>
                    <Slider
                      onValueChange={(value: number[]) => {
                        setSliderValue(() => value[0]);
                        changeRange(value[0]);
                      }}
                      ref={progressBar}
                      max={sliderMax}
                      value={[sliderValue]}
                    />
                    <div className="">
                      {duration && !isNaN(duration) && calculateTime(duration)}
                    </div>
                  </div>
                  <div className="flex flex-row items-center gap-4 py-4 w-full">
                    <Button
                      disabled={!!!currentTrack}
                      onClick={togglePlayPause}
                    >
                      {isPlaying ? <Pause /> : <Play />}
                    </Button>
                  </div>
                </div>
                <Image
                  src={currentTrack?.imageUrl || logo}
                  alt="Photo by Drew Beamer"
                  fill
                  className=" rounded-md object-cover mix-blend-lighten brightness-50 hover:blur-sm pointer-events-none "
                />
              </li>
              {tracks.map((track: any, index) => (
                <li
                  className="select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground flex flex-row justify-between items-center [&:not(:first-child)]:mt-2"
                  key={track.id}
                >
                  <p onClick={() => handleTrackClick(index)}>
                    {track.title.split(" ").slice(0, 5).join(" ")}
                    <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                      {track.description.split(" ").slice(0, 5).join(" ")}
                    </p>
                  </p>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => removeFromQueue(track)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Remove</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </li>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
};

export default AudioPlayer;
