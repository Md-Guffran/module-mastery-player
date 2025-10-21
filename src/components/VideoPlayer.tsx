import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import api from '../api';

declare const YT: any;

interface VideoPlayerProps {
  url: string;
  lessonId: string;
  lessonTitle: string;
  progress: { completed: boolean; watched: boolean };
  onProgress: (update: {
    lessonId: string;
    lessonTitle?: string;
    completed?: boolean;
    watched?: boolean;
    duration?: number;
    watchedSeconds?: number;
  }) => void;
}

// Debounce helper
function debounce<F extends (...args: any[]) => void>(func: F, delay: number) {
  let timer: number;
  return (...args: Parameters<F>) => {
    clearTimeout(timer);
    timer = window.setTimeout(() => func(...args), delay);
  };
}

const getYouTubeVideoId = (url: string): string | null => {
  const regExp = /^.*(youtu.be\/|v\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

export const VideoPlayer = ({ url, onProgress, progress, lessonId, lessonTitle }: VideoPlayerProps) => {
  const videoId = getYouTubeVideoId(url);
  const playerRef = useRef<YT.Player | null>(null);
  const progressBarRef = useRef<HTMLDivElement | null>(null);

  const [playbackRate, setPlaybackRate] = useState(1);
  const [hasWatched, setHasWatched] = useState(progress.watched);
  const [isApiReady, setIsApiReady] = useState(false);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [watchedSeconds, setWatchedSeconds] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  // ✅ Debounced backend update
  const saveProgress = useCallback(
    debounce(async (lessonId: string, lessonTitle: string, time: number) => {
      try {
        await api.post('/api/progress', {
          lessonId,
          lessonTitle,
          watchedSeconds: time,
        });
      } catch (err) {
        console.error('Failed to save progress', err);
      }
    }, 3000),
    []
  );

  // ✅ Load YT API once
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
      (window as any).onYouTubeIframeAPIReady = () => setIsApiReady(true);
    } else {
      setIsApiReady(true);
    }
  }, []);

  // ✅ Fetch saved progress
  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const res = await api.get<{ watchedSeconds: number }>(`/api/progress/${lessonId}`);
        setWatchedSeconds(res.watchedSeconds);
      } catch (err) {
        console.error('Failed to fetch progress', err);
      }
    };
    fetchProgress();
  }, [lessonId]);

  // ✅ Initialize player
  useEffect(() => {
    if (isApiReady && videoId && !playerRef.current) {
      playerRef.current = new YT.Player(`youtube-player-${videoId}`, {
        height: '100%',
        width: '100%',
        videoId,
        playerVars: {
          controls: 0,
          disablekb: 1,
          rel: 0,
          origin: window.location.origin,
        },
        events: {
          onReady: (event: YT.PlayerEvent) => {
            setDuration(event.target.getDuration());
            event.target.setPlaybackRate(playbackRate);
            setIsPlayerReady(true);
          },
          onStateChange: onPlayerStateChange,
        },
      });
    }
  }, [isApiReady, videoId]);

  // ✅ Resume from last progress
  useEffect(() => {
    if (isPlayerReady && playerRef.current && watchedSeconds > 0) {
      playerRef.current.seekTo(watchedSeconds, true);
    }
  }, [isPlayerReady, watchedSeconds]);

  const onPlayerStateChange = (event: YT.OnStateChangeEvent) => {
    if (event.data === YT.PlayerState.ENDED) {
      const endTime = playerRef.current?.getDuration() || 0;
      saveProgress(lessonId, lessonTitle, endTime);
      onProgress({ lessonId, lessonTitle, completed: true, watched: true, watchedSeconds: endTime });
      setHasWatched(true);
    } else if (event.data === YT.PlayerState.PAUSED) {
      const time = playerRef.current?.getCurrentTime() || 0;
      saveProgress(lessonId, lessonTitle, time);
    }
  };

  // ✅ Smooth frame sync using requestAnimationFrame
  useEffect(() => {
    let animationFrame: number;
    let lastSaved = 0;

    const updateProgress = () => {
      if (playerRef.current && isPlayerReady) {
        const time = playerRef.current.getCurrentTime();
        setCurrentTime((prev) => (Math.abs(prev - time) > 1 ? time : prev)); // update only if 1s diff
        if (time - lastSaved > 2) {
          setWatchedSeconds((prev) => Math.max(prev, time));
          lastSaved = time;
          saveProgress(lessonId, lessonTitle, time);
        }
      }
      animationFrame = requestAnimationFrame(updateProgress);
    };

    if (isPlayerReady) updateProgress();
    return () => cancelAnimationFrame(animationFrame);
  }, [isPlayerReady, saveProgress, lessonId, lessonTitle]);

  const handleBackwardSeek = () => {
    const time = playerRef.current?.getCurrentTime();
    if (time === undefined) return;
    playerRef.current?.seekTo(Math.max(0, time - 10), true);
  };

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (progressBarRef.current && duration > 0 && playerRef.current) {
      const rect = progressBarRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const width = rect.width;
      const clickedTime = (clickX / width) * duration;
      const newTime = Math.min(clickedTime, watchedSeconds);
      playerRef.current.seekTo(newTime, true);
      setCurrentTime(newTime);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  if (!videoId) return <div className="aspect-video bg-black flex items-center justify-center text-white">Invalid video URL</div>;

  return (
    <div className="relative aspect-video bg-black group">
      <div id={`youtube-player-${videoId}`} className="absolute top-0 left-0 w-full h-full" />
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div
          ref={progressBarRef}
          className="w-full bg-white/20 h-1.5 cursor-pointer"
          onClick={handleProgressBarClick}
        >
          <div className="bg-red-600 h-full" style={{ width: `${(currentTime / duration) * 100}%` }} />
        </div>
        <div className="flex justify-between items-center mt-2 text-white text-sm">
          <span>{formatTime(currentTime)}</span>
          <div className="flex items-center space-x-4">
            <Button onClick={handleBackwardSeek} variant="ghost" size="sm">
              Rewind 10s
            </Button>
            <select
              value={playbackRate}
              onChange={(e) => {
                const rate = parseFloat(e.target.value);
                setPlaybackRate(rate);
                playerRef.current?.setPlaybackRate(rate);
              }}
              className="bg-transparent text-white rounded px-2 py-1 text-sm"
            >
              <option value={0.5}>0.5x</option>
              <option value={1}>1x</option>
              <option value={1.5}>1.5x</option>
              <option value={2}>2x</option>
            </select>
          </div>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
    </div>
  );
};
