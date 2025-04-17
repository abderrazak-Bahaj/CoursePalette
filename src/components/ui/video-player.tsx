import React from 'react';

interface VideoPlayerProps {
  url: string;
}

const isYouTubeUrl = (url: string) => {
  return /(?:youtube\.com\/watch\?v=|youtu\.be\/)/.test(url);
};

const getYouTubeEmbedUrl = (url: string) => {
  const match = url.match(/(?:v=|youtu\.be\/)([\w-]+)/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : '';
};

const VideoPlayer: React.FC<VideoPlayerProps> = ({ url }) => {
  if (!url) return null;

  return (
    <div className="relative aspect-video rounded-lg overflow-hidden bg-black">
      {isYouTubeUrl(url) ? (
        <iframe
          className="absolute inset-0 w-full h-full"
          src={getYouTubeEmbedUrl(url)}
          title="YouTube Video"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <video
          className="absolute inset-0 w-full h-full"
          controls
          src={url}
          autoPlay={false}
        />
      )}
    </div>
  );
};

export default VideoPlayer;
