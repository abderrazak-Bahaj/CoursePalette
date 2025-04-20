import { useState, useRef, useCallback } from 'react';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDropzone } from 'react-dropzone';

interface ImageUploadProps {
  value?: File | string | null;
  onChange: (file: File | null) => void;
  className?: string;
  maxSize?: number;
  accept?: string[];
}

export function ImageUpload({
  value,
  onChange,
  className,
  maxSize = 5 * 1024 * 1024, // 5MB
  accept = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(
    typeof value === 'string' ? value : null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        handleFile(file);
      }
    },
    [onChange]
  );

  const handleFile = (file: File) => {
    onChange(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: accept.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    maxSize,
    multiple: false,
  });

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div
      {...getRootProps()}
      onClick={handleClick}
      className={cn(
        'relative border-2 border-dashed rounded-lg p-4 transition-colors',
        'hover:border-primary/50 cursor-pointer',
        isDragActive && 'border-primary bg-primary/5',
        className
      )}
    >
      <input
        {...getInputProps()}
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />

      {preview ? (
        <div className="relative group">
          <img
            src={preview}
            alt="Preview"
            className="w-full aspect-[16/9] object-cover rounded-lg"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 p-1 bg-background/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-2 h-48">
          {isDragActive ? (
            <>
              <Upload className="w-8 h-8 text-primary" />
              <p className="text-sm text-muted-foreground">
                Drop the image here
              </p>
            </>
          ) : (
            <>
              <ImageIcon className="w-8 h-8 text-muted-foreground" />
              <div className="text-center">
                <p className="text-sm font-medium">
                  Drag & drop an image here, or click to select
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Supports:{' '}
                  {accept.map((type) => type.split('/')[1]).join(', ')}
                </p>
                <p className="text-xs text-muted-foreground">
                  Max size: {maxSize / (1024 * 1024)}MB
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
