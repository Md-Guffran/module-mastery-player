interface VideoPlayerProps {
  url: string;
}

const getYouTubeVideoId = (url: string): string | null => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

export const VideoPlayer = ({ url }: VideoPlayerProps) => {
  const videoId = getYouTubeVideoId(url);

  if (!videoId) {
    return <div className="aspect-video bg-black flex items-center justify-center text-white">Invalid video URL</div>;
  }

  const embedUrl = `https://www.youtube.com/embed/${videoId}?controls=1`;

  return (
    <div className="relative aspect-video bg-black">
      <iframe
        src={embedUrl}
        title="YouTube video player"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="absolute top-0 left-0 w-full h-full"
      ></iframe>
    </div>
  );
};
