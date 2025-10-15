new

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import api from '../api';

declare const YT: any; // Temporary declaration to resolve TypeScript errors

interface VideoPlayerProps {
  url: string;
  lessonId: string;
  lessonTitle: string;
  progress: { completed: boolean; watched: boolean };
  onProgress: (update: { lessonId: string; lessonTitle?: string; completed?: boolean; watched?: boolean; duration?: number; watchedSeconds?: number }) => void;
}

const getYouTubeVideoId = (url: string): string | null => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
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

  useEffect(() => {
    const loadYouTubeAPI = () => {
      if (!window.YT) {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
        (window as any).onYouTubeIframeAPIReady = () => {
          setIsApiReady(true);
        };
      } else {
        setIsApiReady(true);
      }
    };

    loadYouTubeAPI();

    return () => {
      (window as any).onYouTubeIframeAPIReady = null;
    };
  }, []);

  useEffect(() => {
    if (isApiReady && videoId && !playerRef.current) {
      playerRef.current = new YT.Player(`youtube-player-${videoId}`, {
        height: '100%',
        width: '100%',
        videoId: videoId,
        playerVars: {
          controls: 0, // Disable default controls to use custom ones
          disablekb: 1,
          rel: 0,
          origin: window.location.origin,
        },
        events: {
          onReady: onPlayerReady,
          onStateChange: onPlayerStateChange,
        },
      });
    }
  }, [isApiReady, videoId]); // Remove hasWatched from dependencies

  const onPlayerReady = (event: YT.PlayerEvent) => {
    if (playerRef.current) {
      playerRef.current.setPlaybackRate(playbackRate);
      const playerDuration = event.target.getDuration();
      setDuration(playerDuration);
      onProgress({ lessonId, duration: playerDuration });
      setIsPlayerReady(true);
    }
  };

  useEffect(() => {
    if (isPlayerReady && playerRef.current && watchedSeconds > 0) {
      playerRef.current.seekTo(watchedSeconds, true);
    }
  }, [isPlayerReady, watchedSeconds]);

  const onPlayerStateChange = (event: YT.OnStateChangeEvent) => {
    console.log('VideoPlayer: onPlayerStateChange', { eventData: event.data, lessonId, lessonTitle, progressCompleted: progress.completed });
    if (event.data === YT.PlayerState.ENDED) {
      if (!progress.completed) {
        const finalWatchedSeconds = playerRef.current?.getDuration() || 0;
        console.log('VideoPlayer: Video ENDED, saving final progress', { lessonId, lessonTitle, finalWatchedSeconds });
        saveProgress(lessonId, lessonTitle, finalWatchedSeconds); // Save final progress
        onProgress({ lessonId, lessonTitle, completed: true, watched: true, watchedSeconds: finalWatchedSeconds });
      }
      setHasWatched(true);
    } else if (event.data === YT.PlayerState.PAUSED) {
      const currentTime = playerRef.current?.getCurrentTime();
      if (currentTime) {
        console.log('VideoPlayer: Video PAUSED, saving progress', { lessonId, lessonTitle, currentTime });
        saveProgress(lessonId, lessonTitle, currentTime);
      }
    }
  };

  const saveProgress = useCallback(async (currentLessonId: string, currentLessonTitle: string, currentTime: number) => {
    console.log('VideoPlayer: saveProgress called', { currentLessonId, currentLessonTitle, currentTime });
    try {
      await api.post('/api/progress', {
        lessonId: currentLessonId,
        lessonTitle: currentLessonTitle,
        watchedSeconds: currentTime,
      });
    } catch (err) {
      console.error('Failed to save progress', err);
    }
  }, []);

  const handleBackwardSeek = () => {
    const currentTime = playerRef.current?.getCurrentTime();
    if (currentTime === undefined) return;

    const seekAmount = 10; // seconds
    const newTime = Math.max(0, currentTime - seekAmount);
    playerRef.current?.seekTo(newTime);
  };

  useEffect(() => {
    let progressInterval: number; // Changed NodeJS.Timeout to number

    if (isPlayerReady && playerRef.current) {
      progressInterval = setInterval(() => {
        const currentPlayTime = playerRef.current?.getCurrentTime();
        if (currentPlayTime !== undefined) {
          setCurrentTime(currentPlayTime);
          setWatchedSeconds(prevWatchedSeconds => Math.max(prevWatchedSeconds, currentPlayTime));
        }
      }, 1000); // Update every second
    }

    return () => {
      clearInterval(progressInterval);
      const currentTimeValue = playerRef.current?.getCurrentTime();
      if (currentTimeValue) {
        console.log('VideoPlayer: Component unmounting, saving final progress', { lessonId, lessonTitle, currentTimeValue });
        saveProgress(lessonId, lessonTitle, currentTimeValue); // Pass lessonId and lessonTitle
      }
    };
  }, [isPlayerReady, lessonId, lessonTitle, saveProgress]); // Dependencies for cleanup

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (progressBarRef.current && duration > 0 && playerRef.current) {
      const rect = progressBarRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const width = rect.width;
      const clickedTime = (clickX / width) * duration;

      // Only allow seeking backward or to the furthest watched point
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

  if (!videoId) {
    return <div className="aspect-video bg-black flex items-center justify-center text-white">Invalid video URL</div>;
  }

  return (
    <div className="relative aspect-video bg-black group">
      <div id={`youtube-player-${videoId}`} className="absolute top-0 left-0 w-full h-full" />
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div
          ref={progressBarRef}
          className="w-full bg-white/20 h-1.5 cursor-pointer"
          onClick={handleProgressBarClick}
        >
          <div
            className="bg-red-600 h-full"
            style={{ width: `${(currentTime / duration) * 100}%` }}
          />
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
                const newRate = parseFloat(e.target.value);
                setPlaybackRate(newRate);
                playerRef.current?.setPlaybackRate(newRate);
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
