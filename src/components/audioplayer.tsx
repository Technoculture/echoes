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
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";

import Image from "next/image";
import img from "@/assets/audio_bg.webp";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { calculateTime } from "@/utils/helpers";
type Props = {};

const AudioPlayer = (props: Props) => {
  const {
    currentTrackId,
    isPlaying,
    setIsPlaying,
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

  useEffect(() => {
    if (currentTrack) {
      animationRef.current = requestAnimationFrame(whilePlaying);
    } else {
      setSliderValue(0);
      setSliderMax(0);
      setDuration(0);
      audioRef.current?.load();
    }
  }, [currentTrack]);

  const handleTrackClick = (index: number) => {
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
  const [tracksToShow, setTracksToShow] = useState<any[]>(() =>
    tracks.slice(0, 3),
  );
  const [pageNo, setPageNo] = useState<number>(1);

  useEffect(() => {
    if (pageNo === 1) {
      setTracksToShow(tracks.slice(0, 3));
    } else {
      setTracksToShow(tracks.slice((pageNo - 1) * 3, 3 * pageNo));
    }
  }, [tracks, pageNo]);
  const togglePlayPause = () => {
    if (isPlaying) {
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
    }
  };

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play();
        animationRef.current = requestAnimationFrame(whilePlaying);
      } else {
        audioRef.current.pause();
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      }
    }
  }, [isPlaying]);

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
    <>
      <Dialog>
        <DialogTrigger asChild className="max-h-[32px]">
          <Button variant="ghost">
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
          </Button>
        </DialogTrigger>
        <DialogContent>
          <div className="grid sm:grid-cols-2 grid-cols[repeat(auto-fill, minmax(clamp(300px, 100vw / 4, 300px), 1fr))] gap-3 p-5">
            <div className="grid grid-flow-col grid-rows-3  min-h-48">
              <div className="relative row-span-2">
                <Image
                  src={currentTrack?.imageUrl || img}
                  alt="Photo by Drew Beamer"
                  fill
                  className=" rounded-md object-cover mix-blend-lighten brightness-50 hover:blur-sm pointer-events-none "
                />
              </div>
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
                    {!isNaN(duration) && calculateTime(duration)}
                  </div>
                </div>
                <div className="flex flex-row items-center gap-4 py-4 w-full">
                  <Button disabled={!!!currentTrack} onClick={togglePlayPause}>
                    {isPlaying ? <Pause /> : <Play />}
                  </Button>
                </div>
              </div>
            </div>
            <div>
              {tracksToShow.map((track: any, index) => (
                <div
                  className="select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground flex flex-row justify-between items-center"
                  key={track.id}
                >
                  <div onClick={() => handleTrackClick(index)}>
                    {track.title.split(" ").slice(0, 5).join(" ")}
                    <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                      {track.description &&
                        track.description.split(" ").slice(0, 5).join(" ")}
                    </p>
                  </div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
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
                </div>
              ))}
            </div>
          </div>
          <DialogFooter className="flex flex-row justify-end gap-2 px-5">
            {!(pageNo <= 1) && (
              <Button
                onClick={() => setPageNo((prev) => prev - 1)}
                disabled={pageNo <= 1 ? true : false}
                variant="ghost"
                size="icon"
                className=""
              >
                <ChevronLeft />
              </Button>
            )}
            {!(pageNo >= Math.ceil(tracks.length / 3) || tracks.length < 3) && (
              <Button
                onClick={() => setPageNo((prev) => prev + 1)}
                disabled={
                  pageNo >= Math.ceil(tracks.length / 3) || tracks.length < 3
                    ? true
                    : false
                }
                variant="ghost"
                size="icon"
                className=""
              >
                <ChevronRight />
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AudioPlayer;