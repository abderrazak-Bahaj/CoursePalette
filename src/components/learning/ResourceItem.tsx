import {
  FileText,
  Video,
  Headphones,
  Link as LinkIcon,
  Download,
  ExternalLink,
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

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'PDF':
        return <FileText className="h-5 w-5 text-red-400" />;
      case 'VIDEO':
        return <Video className="h-5 w-5 text-violet-400" />;
      case 'AUDIO':
        return <Headphones className="h-5 w-5 text-amber-400" />;
      case 'LINK':
        return <LinkIcon className="h-5 w-5 text-green-400" />;
      default:
        return <FileText className="h-5 w-5 text-neutral-400" />;
    }
  };

  const getResourceTypeLabel = (type: string) => {
    switch (type) {
      case 'PDF':
        return 'Document';
      case 'VIDEO':
        return 'Video';
      case 'AUDIO':
        return 'Audio';
      case 'LINK':
        return 'Link';
      default:
        return 'File';
    }
  };

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
        'flex items-center p-4 border rounded-xl transition-all duration-200 cursor-pointer',
        isDownloading
          ? 'bg-violet-600/10 border-violet-500/50'
          : 'bg-[#1e293b] border-neutral-700 hover:border-violet-500/50 hover:bg-[#1e293b]'
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
      <div className="flex-shrink-0 mr-3">{getResourceIcon(resource.type)}</div>

      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-neutral-100">{resource.title}</h4>
        {resourceAny.description && (
          <p className="text-sm text-neutral-400 mt-0.5 line-clamp-2">
            {resourceAny.description}
          </p>
        )}
        <div className="flex items-center gap-3 mt-2">
          <span className="text-xs text-neutral-500 bg-neutral-700/50 px-2 py-0.5 rounded">
            {getResourceTypeLabel(resource.type)}
          </span>
          {resource.file_size_formatted && (
            <span className="text-xs text-neutral-500">
              {resource.file_size_formatted}
            </span>
          )}
          {isLink && (
            <span className="text-xs text-violet-400 bg-violet-600/10 px-2 py-0.5 rounded">
              External Link
            </span>
          )}
        </div>
      </div>

      <div className="flex-shrink-0 ml-3 flex flex-col items-center gap-1">
        {isDownloading ? (
          <Download className="h-4 w-4 text-violet-400 animate-bounce" />
        ) : isLink ? (
          <ExternalLink className="h-4 w-4 text-neutral-400" />
        ) : canDownload ? (
          <Download className="h-4 w-4 text-neutral-400" />
        ) : (
          <FileText className="h-4 w-4 text-neutral-400" />
        )}
        <span className="text-xs text-neutral-500">
          {isDownloading
            ? 'Downloading...'
            : isLink
              ? 'Open Link'
              : canDownload
                ? 'Download'
                : 'View'}
        </span>
      </div>
    </div>
  );
};

export default ResourceItem;
