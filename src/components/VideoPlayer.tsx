// @ts-nocheck
import { useState, useRef, useEffect } from 'react';
import ReactPlayer from 'react-player';
import { Play, Pause, Volume2, VolumeX, Maximize, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { CourseProgress } from '@/types/course';

interface VideoPlayerProps {
  url: string;
  lessonId: string;
  progress: CourseProgress;
  onProgress: (progress: Partial<CourseProgress>) => void;
}

export const VideoPlayer = ({ url, lessonId, progress, onProgress }: VideoPlayerProps) => {
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [played, setPlayed] = useState(0);
  const [duration, setDuration] = useState(0);
  const [seeking, setSeeking] = useState(false);
  const [loading, setLoading] = useState(true);
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Restore progress
    if (progress.watchedSeconds && duration > 0) {
      const seekTo = progress.watchedSeconds / duration;
      playerRef.current?.seekTo(seekTo);
      setPlayed(seekTo);
    }
  }, [lessonId, duration, progress.watchedSeconds]);

  const handleProgress = (state: any) => {
    if (!seeking) {
      const currentPlayed = state.played;
      
      // Anti-skip logic: only allow forward progress if unlocked or within current max progress
      if (!progress.unlockedSeek && currentPlayed > played + 0.01) {
        // User tried to skip ahead - prevent it
        playerRef.current?.seekTo(played);
        return;
      }

      setPlayed(currentPlayed);
      
      // Update progress
      onProgress({
        watchedSeconds: state.playedSeconds,
        totalDuration: duration,
      });

      // Check if video completed
      if (currentPlayed >= 0.98 && !progress.completed) {
        onProgress({
          completed: true,
          unlockedSeek: true,
          watchedSeconds: duration,
        });
      }
    }
  };

  const handleSeekChange = (value: number[]) => {
    const newPlayed = value[0] / 100;
    
    // Only allow seeking if unlocked or rewinding
    if (progress.unlockedSeek || newPlayed <= played) {
      setPlayed(newPlayed);
    }
  };

  const handleSeekMouseDown = () => {
    setSeeking(true);
  };

  const handleSeekMouseUp = (value: number[]) => {
    setSeeking(false);
    const newPlayed = value[0] / 100;
    
    // Only allow seeking if unlocked or rewinding
    if (progress.unlockedSeek || newPlayed <= played) {
      playerRef.current?.seekTo(newPlayed);
    } else {
      // Reset to current position
      playerRef.current?.seekTo(played);
    }
  };

  const toggleFullscreen = () => {
    if (containerRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        containerRef.current.requestFullscreen();
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div ref={containerRef} className="relative bg-card rounded-lg overflow-hidden shadow-lg group">
      <div className="relative aspect-video bg-black">
        <ReactPlayer
          ref={playerRef}
          url={url}
          playing={playing}
          volume={volume}
          muted={muted}
          width="100%"
          height="100%"
          onProgress={handleProgress}
          onDuration={setDuration}
          onReady={() => setLoading(false)}
          onBuffer={() => setLoading(true)}
          onBufferEnd={() => setLoading(false)}
          progressInterval={500}
        />
        
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
          </div>
        )}
      </div>

      {/* Custom Controls */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
        {/* Progress Bar */}
        <div className="mb-3">
          <Slider
            value={[played * 100]}
            onValueChange={handleSeekChange}
            onPointerDown={handleSeekMouseDown}
            onPointerUp={(e) => {
              const value = [played * 100];
              handleSeekMouseUp(value);
            }}
            max={100}
            step={0.1}
            className="cursor-pointer"
          />
          <div className="flex justify-between text-xs text-white/80 mt-1">
            <span>{formatTime(played * duration)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setPlaying(!playing)}
              className="text-white hover:bg-white/20"
            >
              {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </Button>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setMuted(!muted)}
                className="text-white hover:bg-white/20"
              >
                {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </Button>
              <Slider
                value={[muted ? 0 : volume * 100]}
                onValueChange={(v) => {
                  setVolume(v[0] / 100);
                  setMuted(false);
                }}
                max={100}
                className="w-20"
              />
            </div>
          </div>

          <Button
            size="sm"
            variant="ghost"
            onClick={toggleFullscreen}
            className="text-white hover:bg-white/20"
          >
            <Maximize className="w-5 h-5" />
          </Button>
        </div>

        {!progress.unlockedSeek && (
          <div className="mt-2 text-xs text-yellow-400 text-center">
            🔒 Complete the video once to unlock seek controls
          </div>
        )}
      </div>
    </div>
  );
};
