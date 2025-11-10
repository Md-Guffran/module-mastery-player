import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import api from '../api';
import { formatDurationMMSS } from '@/utils/duration';
import { Play, Pause, RotateCcw, RotateCw, Volume2, VolumeX, Maximize } from 'lucide-react'; // Import icons

interface YouTubePlayer {
  cueVideoById: (videoId: string, startSeconds: number, suggestedQuality?: string) => void;
  loadVideoById: (videoId: string, startSeconds: number, suggestedQuality?: string) => void;
  cueVideoByUrl: (mediaContentUrl: string, startSeconds: number, suggestedQuality?: string) => void;
  loadVideoByUrl: (mediaContentUrl: string, startSeconds: number, suggestedQuality?: string) => void;
  cuePlaylist: (playlist: string | string[], index?: number, startSeconds?: number, suggestedQuality?: string) => void;
  loadPlaylist: (playlist: string | string[], index?: number, startSeconds?: number, suggestedQuality?: string) => void;
  playVideo: () => void;
  pauseVideo: () => void;
  stopVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  clearVideo: () => void;
  getDuration: () => number;
  getCurrentTime: () => number;
  getPlaybackQuality: () => string;
  setPlaybackQuality: (suggestedQuality: string) => void;
  getAvailablePlaybackQualities: () => string[];
  getPlaybackRate: () => number;
  setPlaybackRate: (rate: number) => void;
  getAvailablePlaybackRates: () => number[];
  setVolume: (volume: number) => void;
  getVolume: () => number;
  mute: () => void;
  unMute: () => void;
  isMuted: () => boolean;
  getPlayerState: () => number;
  getVideoUrl: () => string;
  getVideoEmbedCode: () => string;
  getVideoLoadedFraction: () => number;
  getPlaylist: () => string[];
  getPlaylistIndex: () => number;
  addEventListener: (event: string, listener: (event: any) => void) => void;
  removeEventListener: (event: string, listener: (event: any) => void) => void;
  destroy: () => void;
}

interface YouTubePlayerEvent {
  target: YouTubePlayer;
  data: number;
}

interface YouTubePlayerOptions {
  height: string;
  width: string;
  videoId: string;
  playerVars: {
    controls: number;
    disablekb: number;
    rel: number;
    modestbranding: number;
    origin: string;
  };
  events: {
    onReady: (event: YouTubePlayerEvent) => void;
    onStateChange: (event: YouTubePlayerEvent) => void;
  };
}

interface YouTube {
  Player: new (elementId: string, options: YouTubePlayerOptions) => YouTubePlayer;
  PlayerState: {
    ENDED: number;
    PLAYING: number;
    PAUSED: number;
    BUFFERING: number;
    CUED: number;
  };
}

declare global {
  interface Window {
    YT: YouTube;
    onYouTubeIframeAPIReady: () => void;
  }
}

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
function debounce<T extends (...args: any[]) => void>(func: T, delay: number): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => func(...args), delay);
  };
}

const getYouTubeVideoId = (url: string): string | null => {
  const regExp = /^.*(youtu.be\/|v\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  const extractedId = match && match[2].length === 11 ? match[2] : null;
  return extractedId;
};

export const VideoPlayer = ({ url, onProgress, progress, lessonId, lessonTitle }: VideoPlayerProps) => {
  const videoId = getYouTubeVideoId(url);
  const playerRef = useRef<YT.Player | null>(null);
  const progressBarRef = useRef<HTMLDivElement | null>(null);
  const videoContainerRef = useRef<HTMLDivElement | null>(null); // Add ref for video container

  const [playbackRate, setPlaybackRate] = useState(1);
  const [hasWatched, setHasWatched] = useState(progress.watched);
  const [isApiReady, setIsApiReady] = useState(false);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [watchedSeconds, setWatchedSeconds] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false); // Add state for play/pause
  const [volume, setVolume] = useState(100); // Add state for volume
  const [isMuted, setIsMuted] = useState(false); // Add state for mute
  const [isFullScreen, setIsFullScreen] = useState(false); // Add state for full screen

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
      window.onYouTubeIframeAPIReady = () => setIsApiReady(true);
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
      playerRef.current = new window.YT.Player(`youtube-player-${videoId}`, {
        height: '100%',
        width: '100%',
        videoId,
        playerVars: {
          // Disable player controls, which should hide the video title link (ytp-title-link)
          controls: 0,
          disablekb: 1,
          rel: 0,
          modestbranding: 1, // Further attempts to minimize YouTube branding and controls
          origin: window.location.origin,
        },
        events: {
          onReady: (event: YouTubePlayerEvent) => {
            setDuration(event.target.getDuration());
            event.target.setPlaybackRate(playbackRate);
            setIsPlayerReady(true);
          },
          onStateChange: onPlayerStateChange,
        },
      });
    }
  }, [isApiReady, videoId, playbackRate]); // Added playbackRate to dependencies

  // ✅ Resume from last progress
  useEffect(() => {
    if (isPlayerReady && playerRef.current && watchedSeconds > 0) {
      playerRef.current.seekTo(watchedSeconds, true);
    }
  }, [isPlayerReady, watchedSeconds]);

  const onPlayerStateChange = (event: YouTubePlayerEvent) => {
    if (event.data === (window.YT.PlayerState.ENDED as number)) {
      const endTime = playerRef.current?.getDuration() || 0;
      saveProgress(lessonId, lessonTitle, endTime);
      onProgress({ lessonId, lessonTitle, completed: true, watched: true, watchedSeconds: endTime });
      setHasWatched(true);
      setIsPlaying(false); // Update play state
    } else if (event.data === (window.YT.PlayerState.PAUSED as number)) {
      const time = playerRef.current?.getCurrentTime() || 0;
      saveProgress(lessonId, lessonTitle, time);
      setIsPlaying(false); // Update play state
    } else if (event.data === (window.YT.PlayerState.PLAYING as number)) {
      setIsPlaying(true); // Update play state
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

  const handlePlayPause = () => { // Add play/pause handler
    if (!playerRef.current) return;
    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
    setIsPlaying(!isPlaying);
  };

  const handleBackwardSeek = () => {
    const time = playerRef.current?.getCurrentTime();
    if (time === undefined) return;
    playerRef.current?.seekTo(Math.max(0, time - 10), true);
  };
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => { // Add volume change handler
    const newVolume = parseInt(e.target.value, 10);
    setVolume(newVolume);
    playerRef.current?.setVolume(newVolume);
    if (newVolume > 0) setIsMuted(false);
  };

  const handleToggleMute = () => { // Add mute toggle handler
    if (!playerRef.current) return;
    if (isMuted) {
      playerRef.current.unMute();
      playerRef.current.setVolume(volume);
    } else {
      playerRef.current.mute();
    }
    setIsMuted(!isMuted);
  };

  const handleFullScreenToggle = () => { // Add full screen toggle handler
    if (videoContainerRef.current) {
      if (!document.fullscreenElement) {
        videoContainerRef.current.requestFullscreen().catch((err) => {
          console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
        });
      } else {
        document.exitFullscreen();
      }
    }
  };

  useEffect(() => { // Add full screen change listener
    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullScreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullScreenChange);
  }, []);

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

  if (!videoId)
    return (
      <div className="aspect-video bg-black flex items-center justify-center text-white">
        Invalid video URL
      </div>
    );

  return (
    <div ref={videoContainerRef} className="relative aspect-video bg-black group"> {/* Attach ref here */}
      <div id={`youtube-player-${videoId}`} className="absolute top-0 left-0 w-full h-full" />
      {/* Overlay to disable clicks on the top part of the iframe content (title/header) */}
      <div className="absolute top-0 left-0 w-full h-[80%] z-10" />
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
        <div
          ref={progressBarRef}
          className="w-full bg-white/20 h-1.5 cursor-pointer relative" // Added relative for scrubber
          onClick={handleProgressBarClick}
        >
          <div className="bg-red-600 h-full" style={{ width: `${(currentTime / duration) * 100}%` }} />
          {/* Scrubber */}
          <div
            className="absolute -top-1 h-4 w-4 bg-red-600 rounded-full -ml-2"
            style={{ left: `${(currentTime / duration) * 100}%` }}
          />
        </div>
        <div className="flex justify-between items-center mt-2 text-white text-sm">
          <div className="flex items-center space-x-2"> {/* Group play/seek buttons */}
            <Button onClick={handlePlayPause} variant="ghost" size="icon" className="h-8 w-8">
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <Button onClick={handleBackwardSeek} variant="ghost" size="icon" className="h-8 w-8">
              <RotateCcw className="h-4 w-4" />
            </Button>
            <span>{formatDurationMMSS(currentTime)} / {formatDurationMMSS(duration)}</span>
          </div>

          <div className="flex items-center space-x-4"> {/* Group volume/speed/fullscreen buttons */}
            <Button onClick={handleToggleMute} variant="ghost" size="icon" className="h-8 w-8">
              {isMuted || volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
            <input
              type="range"
              min="0"
              max="100"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-24 h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-red-600"
            />
            <select
              value={playbackRate}
              onChange={(e) => {
                const rate = parseFloat(e.target.value);
                setPlaybackRate(rate);
                playerRef.current?.setPlaybackRate(rate);
              }}
              className="bg-gray-200 text-black rounded px-2 py-1 text-sm"
            >
              <option value={0.5}>0.5x</option>
              <option value={1}>1x</option>
              <option value={1.5}>1.5x</option>
              <option value={2}>2x</option>
            </select>
            <Button onClick={handleFullScreenToggle} variant="ghost" size="icon" className="h-8 w-8">
              <Maximize className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
