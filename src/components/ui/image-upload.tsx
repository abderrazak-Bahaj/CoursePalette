import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { X } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
  value?: string;
  onChange?: (file: File | null) => void;
  onRemove?: () => void;
  disabled?: boolean;
  accept?: string;
  maxSize?: number;
  className?: string;
}

export const ImageUpload = ({
  value,
  onChange,
  onRemove,
  disabled,
  accept = 'image/*',
  maxSize = 5 * 1024 * 1024, // 5MB default
  className,
}: ImageUploadProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        if (file.size > maxSize) {
          alert(`File size must be less than ${maxSize / (1024 * 1024)}MB`);
          return;
        }
        onChange?.(file);
      }
    },
    [maxSize, onChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    disabled,
    accept: accept ? { [accept]: [] } : undefined,
    maxFiles: 1,
  });

  const handleRemove = () => {
    onChange?.(null);
    onRemove?.();
  };

  const isVideo = accept.includes('video');

  return (
    <div
      {...getRootProps()}
      className={cn(
        'relative w-full rounded-lg border-2 border-dashed border-gray-300 p-4 transition-colors',
        isDragActive && 'border-primary bg-primary/10',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <input {...getInputProps()} />
      {value ? (
        <div className="relative">
          {isVideo ? (
            <video
              src={value}
              className="w-full aspect-video object-cover rounded-lg"
              controls
            />
          ) : (
            <img
              src={value}
              alt="Upload preview"
              className="w-full aspect-video object-cover rounded-lg"
            />
          )}
          {!disabled && isHovered && (
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2"
              onClick={(e) => {
                e.stopPropagation();
                handleRemove();
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-2 text-center">
          <div className="text-sm text-muted-foreground">
            {isDragActive ? (
              <p>Drop the {isVideo ? 'video' : 'image'} here...</p>
            ) : (
              <p>
                Drag & drop {isVideo ? 'a video' : 'an image'} here, or click to
                select
              </p>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {isVideo ? 'MP4, WebM, etc.' : 'JPG, PNG, etc.'} (max.{' '}
            {maxSize / (1024 * 1024)}MB)
          </p>
        </div>
      )}
    </div>
  );
};
