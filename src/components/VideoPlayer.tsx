import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';

interface VideoPlayerProps {
  url: string;
  lessonId: string;
  progress: { completed: boolean; watched: boolean };
  onProgress: (update: { lessonId: string; completed?: boolean; watched?: boolean; duration?: number }) => void;
}

const getYouTubeVideoId = (url: string): string | null => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

export const VideoPlayer = ({ url, onProgress, progress, lessonId }: VideoPlayerProps) => {
  const videoId = getYouTubeVideoId(url);
  const playerRef = useRef<YT.Player | null>(null);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [hasWatched, setHasWatched] = useState(progress.watched);
  const [isApiReady, setIsApiReady] = useState(false);

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
          controls: hasWatched ? 1 : 0,
          disablekb: hasWatched ? 0 : 1,
          rel: 0,
          origin: window.location.origin,
        },
        events: {
          onReady: onPlayerReady,
          onStateChange: onPlayerStateChange,
        },
      });
    }
  }, [isApiReady, videoId, hasWatched]);

  const onPlayerReady = (event: YT.PlayerEvent) => {
    if (playerRef.current) {
      playerRef.current.setPlaybackRate(playbackRate);
      const duration = event.target.getDuration();
      onProgress({ lessonId, duration });
    }
  };

  const onPlayerStateChange = (event: YT.OnStateChangeEvent) => {
    if (event.data === YT.PlayerState.ENDED) {
      if (!progress.completed) {
        onProgress({ lessonId, completed: true, watched: true });
      }
      setHasWatched(true);
    }
  };

  const handleBackwardSeek = () => {
    const currentTime = playerRef.current?.getCurrentTime();
    if (currentTime === undefined) return;

    const seekAmount = 10; // seconds
    const newTime = Math.max(0, currentTime - seekAmount);
    playerRef.current?.seekTo(newTime);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (playerRef.current && typeof playerRef.current.getPlayerState === 'function' && playerRef.current.getPlayerState() === YT.PlayerState.PLAYING) {
        const duration = playerRef.current.getDuration();
        const currentTime = playerRef.current.getCurrentTime();
        if (duration > 0 && currentTime / duration >= 0.95) {
          if (!progress.completed) {
            onProgress({ lessonId: lessonId, completed: true, watched: true });
            setHasWatched(true);
          }
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [progress.completed, onProgress]);

  if (!videoId) {
    return <div className="aspect-video bg-black flex items-center justify-center text-white">Invalid video URL</div>;
  }

  return (
    <div className="relative aspect-video bg-black">
      <div id={`youtube-player-${videoId}`} className="absolute top-0 left-0 w-full h-full" />
      <div className="absolute top-2 right-2 flex space-x-2 z-10">
        <select
          value={playbackRate}
          onChange={(e) => {
            const newRate = parseFloat(e.target.value);
            setPlaybackRate(newRate);
            playerRef.current?.setPlaybackRate(newRate);
          }}
          className="bg-black bg-opacity-50 text-white rounded px-2 py-1 text-sm"
        >
          <option value={0.5}>0.5x</option>
          <option value={1}>1x</option>
          <option value={1.5}>1.5x</option>
          <option value={2}>2x</option>
        </select>
        {!hasWatched && (
          <Button onClick={handleBackwardSeek} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm">
            Rewind 10s
          </Button>
        )}
      </div>
    </div>
  );
};
