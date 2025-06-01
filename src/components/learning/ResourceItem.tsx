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

interface ResourceItemProps {
  resource: Resource;
}

const ResourceItem = ({ resource }: ResourceItemProps) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const { toast } = useToast();

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'PDF':
        return <FileText className="h-5 w-5 text-red-500" />;
      case 'VIDEO':
        return <Video className="h-5 w-5 text-blue-500" />;
      case 'AUDIO':
        return <Headphones className="h-5 w-5 text-purple-500" />;
      case 'LINK':
        return <LinkIcon className="h-5 w-5 text-green-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
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
  const canDownload = !isLink && (resource.file_url || resource.file_path);

  const handleResourceClick = async () => {
    try {
      if (isLink) {
        // Handle external links
        const url = resource.file_url || resource.url;
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
        // Handle file downloads
        setIsDownloading(true);
        const url = resource.file_url || resource.file_path;

        if (url) {
          // Create a temporary link element for download
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
            description: 'File URL is not available for download',
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
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to access resource',
        variant: 'destructive',
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const getActionIcon = () => {
    if (isDownloading) {
      return <Download className="h-4 w-4 text-gray-400 animate-bounce" />;
    }

    if (isLink) {
      return <ExternalLink className="h-4 w-4 text-gray-400" />;
    }

    if (canDownload) {
      return <Download className="h-4 w-4 text-gray-400" />;
    }

    return <FileText className="h-4 w-4 text-gray-400" />;
  };

  const getActionText = () => {
    if (isDownloading) return 'Downloading...';
    if (isLink) return 'Open Link';
    if (canDownload) return 'Download';
    return 'View';
  };

  return (
    <div
      className={`flex items-center p-4 border rounded-lg transition-colors cursor-pointer ${
        isDownloading
          ? 'bg-blue-50 border-blue-200'
          : 'hover:bg-gray-50 hover:border-gray-300'
      }`}
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

      <div className="flex-1">
        <h4 className="font-medium text-gray-900">{resource.title}</h4>
        {resource.description && (
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
            {resource.description}
          </p>
        )}
        <div className="flex items-center space-x-4 mt-2">
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {getResourceTypeLabel(resource.type)}
          </span>
          {resource.file_size_formatted && (
            <span className="text-xs text-gray-500">
              {resource.file_size_formatted}
            </span>
          )}
          {isLink && (
            <span className="text-xs text-blue-500 bg-blue-100 px-2 py-1 rounded">
              External Link
            </span>
          )}
        </div>
      </div>

      <div className="flex-shrink-0 ml-3 flex flex-col items-center">
        {getActionIcon()}
        <span className="text-xs text-gray-500 mt-1">{getActionText()}</span>
      </div>
    </div>
  );
};

export default ResourceItem;
