import {
  FileText,
  Video,
  Headphones,
  Link as LinkIcon,
  Download,
  ExternalLink,
  File,
} from 'lucide-react';
import { Resource } from '@/types/course';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface ResourceItemProps {
  resource: Resource;
}

const ResourceItem = ({ resource }: ResourceItemProps) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const { toast } = useToast();

  const resourceAny = resource as any;

  const getResourceConfig = (type: string) => {
    switch (type) {
      case 'PDF':
        return {
          icon: FileText,
          label: 'Document',
          color: 'text-rose-400',
          bg: 'bg-rose-500/10',
          border: 'border-rose-500/20',
          hoverBorder: 'hover:border-rose-500/40',
          accent: 'bg-rose-500',
        };
      case 'VIDEO':
        return {
          icon: Video,
          label: 'Video',
          color: 'text-violet-400',
          bg: 'bg-violet-500/10',
          border: 'border-violet-500/20',
          hoverBorder: 'hover:border-violet-500/40',
          accent: 'bg-violet-500',
        };
      case 'AUDIO':
        return {
          icon: Headphones,
          label: 'Audio',
          color: 'text-amber-400',
          bg: 'bg-amber-500/10',
          border: 'border-amber-500/20',
          hoverBorder: 'hover:border-amber-500/40',
          accent: 'bg-amber-500',
        };
      case 'LINK':
        return {
          icon: LinkIcon,
          label: 'Link',
          color: 'text-emerald-400',
          bg: 'bg-emerald-500/10',
          border: 'border-emerald-500/20',
          hoverBorder: 'hover:border-emerald-500/40',
          accent: 'bg-emerald-500',
        };
      default:
        return {
          icon: File,
          label: 'File',
          color: 'text-neutral-400',
          bg: 'bg-neutral-500/10',
          border: 'border-neutral-500/20',
          hoverBorder: 'hover:border-neutral-500/40',
          accent: 'bg-neutral-500',
        };
    }
  };

  const config = getResourceConfig(resource.type);
  const Icon = config.icon;

  const isLink =
    resource.type === 'LINK' || resource.file_url?.startsWith('http');
  const canDownload = !isLink && (resource.file_url || resourceAny.file_path);

  const handleResourceClick = async () => {
    try {
      if (isLink) {
        const url = resource.file_url || resourceAny.url;
        if (url) {
          window.open(url, '_blank', 'noopener,noreferrer');
        } else {
          toast({
            title: 'Error',
            description: 'Link URL is not available',
            variant: 'destructive',
          });
        }
      } else if (canDownload) {
        setIsDownloading(true);
        const url = resource.file_url || resourceAny.file_path;
        if (url) {
          const link = document.createElement('a');
          link.href = url;
          link.download = resource.title || 'download';
          link.target = '_blank';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          toast({
            title: 'Download Started',
            description: `Downloading ${resource.title}...`,
          });
        } else {
          toast({
            title: 'Error',
            description: 'File URL is not available',
            variant: 'destructive',
          });
        }
      } else {
        toast({
          title: 'Error',
          description: 'Resource is not available',
          variant: 'destructive',
        });
      }
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to access resource',
        variant: 'destructive',
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div
      className={cn(
        'group relative flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 cursor-pointer',
        config.border,
        config.hoverBorder,
        'bg-neutral-900/50 hover:bg-neutral-800/60',
        isDownloading && 'ring-1 ring-violet-500/50'
      )}
      onClick={handleResourceClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleResourceClick();
        }
      }}
    >
      {/* Icon container */}
      <div
        className={cn(
          'flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-lg',
          config.bg
        )}
      >
        <Icon className={cn('h-5 w-5', config.color)} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-sm text-neutral-100 truncate group-hover:text-white transition-colors">
          {resource.title}
        </h4>
        <div className="flex items-center gap-2 mt-1.5">
          <span
            className={cn(
              'inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-full',
              config.bg,
              config.color
            )}
          >
            {config.label}
          </span>
          {resource.file_size_formatted && (
            <span className="text-[11px] text-neutral-500">
              {resource.file_size_formatted}
            </span>
          )}
        </div>
      </div>

      {/* Action */}
      <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-lg bg-neutral-800 group-hover:bg-neutral-700 transition-colors">
        {isDownloading ? (
          <Download className={cn('h-4 w-4 animate-bounce', config.color)} />
        ) : isLink ? (
          <ExternalLink className="h-4 w-4 text-neutral-400 group-hover:text-white transition-colors" />
        ) : canDownload ? (
          <Download className="h-4 w-4 text-neutral-400 group-hover:text-white transition-colors" />
        ) : (
          <ExternalLink className="h-4 w-4 text-neutral-400 group-hover:text-white transition-colors" />
        )}
      </div>
    </div>
  );
};

export default ResourceItem;
