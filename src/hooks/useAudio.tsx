import { useEffect, useRef, useState, useCallback } from 'react';

interface UseAudioOptions {
  loop?: boolean;
  volume?: number;
}

export function useAudio(src: string, options: UseAudioOptions = {}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const audio = new Audio(src);
    audio.loop = options.loop || false;
    audio.volume = options.volume || 0.5;
    audioRef.current = audio;

    const handleCanPlay = () => setIsLoaded(true);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('canplaythrough', handleCanPlay);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.pause();
      audio.removeEventListener('canplaythrough', handleCanPlay);
      audio.removeEventListener('ended', handleEnded);
      audio.src = '';
    };
  }, [src, options.loop, options.volume]);

  const play = useCallback(() => {
    if (audioRef.current && isLoaded) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  }, [isLoaded]);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  }, []);

  return { play, pause, stop, isPlaying, isLoaded };
}
