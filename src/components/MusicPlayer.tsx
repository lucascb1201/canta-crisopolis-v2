"use client";

import { useState, useRef } from "react";
import { FaPlay, FaPause, FaMusic } from "react-icons/fa";

interface MusicPlayerProps {
  url: string;
  name: string;
}

export default function MusicPlayer({ url, name }: MusicPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        // Pause all other audio elements
        document.querySelectorAll("audio").forEach((audio) => {
          if (audio !== audioRef.current) {
            audio.pause();
          }
        });
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
  };

  return (
    <div className="flex items-center gap-2">
      <audio
        ref={audioRef}
        src={url}
        onEnded={handleEnded}
        onPause={() => setIsPlaying(false)}
      />
      <button
        onClick={togglePlay}
        className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-3 py-1.5 rounded-full transition-colors text-sm"
      >
        {isPlaying ? (
          <>
            <FaPause /> Pausar
          </>
        ) : (
          <>
            <FaPlay className="ml-0.5" /> Ouvir
          </>
        )}
      </button>
      <FaMusic className="text-primary-400" />
    </div>
  );
}
