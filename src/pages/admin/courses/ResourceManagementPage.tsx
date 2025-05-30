import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AdminLayout from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
  FileText,
  Video,
  Link,
  Download,
  Upload,
  ArrowLeft,
  Save,
  X,
} from 'lucide-react';
import { resourceService } from '@/services/api/resourceService';
import { lessonService } from '@/services/api/lessonService';
import { useToast } from '@/hooks/use-toast';
import { Resource } from '@/types/course';
import { useUrlParams } from '@/hooks/useUrlParams';

interface ResourceFormData {
  title: string;
  type: 'PDF' | 'VIDEO' | 'AUDIO' | 'LINK' | 'OTHER';
  file_url?: string;
  file?: File;
  order: number;
}

const ResourceManagementPage = () => {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const { getParam } = useUrlParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [resourceToDelete, setResourceToDelete] = useState<Resource | null>(null);
  const [formData, setFormData] = useState<ResourceFormData>({
    title: '',
    type: 'PDF',
    order: 1,
  });

  // Get course context from query params for better navigation
  const courseIdFromQuery = getParam('courseId');
  const backUrl = courseIdFromQuery 
    ? `/admin/lessons?courseId=${courseIdFromQuery}`
    : '/admin/lessons';

  // Fetch lesson details
  const { data: lesson } = useQuery({
    queryKey: ['lesson', courseId, lessonId],
    queryFn: async () => await lessonService.getLesson(courseId!, lessonId!),
    enabled: !!courseId && !!lessonId,
  });

  // Fetch resources for the lesson
  const {
    data: resourcesResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['resources', courseId, lessonId],
    queryFn: async () => await resourceService.getLessonResources(courseId!, lessonId!),
    enabled: !!courseId && !!lessonId,
  });

  const resources = resourcesResponse?.resources || [];

  console.log(resourcesResponse);

  // Create resource mutation
  const createMutation = useMutation({
    mutationFn: (data: any) => resourceService.createResource(courseId!, data),
    onSuccess: () => {
      toast({
        title: 'Resource created',
        description: 'The resource has been created successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['resources', courseId] });
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create resource',
        variant: 'destructive',
      });
    },
  });

  // Update resource mutation
  const updateMutation = useMutation({
    mutationFn: ({ resourceId, data }: { resourceId: string; data: any }) =>
      resourceService.updateResource(courseId!, resourceId, data),
    onSuccess: () => {
      toast({
        title: 'Resource updated',
        description: 'The resource has been updated successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['resources', courseId] });
      resetForm();
      setEditingResource(null);
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update resource',
        variant: 'destructive',
      });
    },
  });

  // Delete resource mutation
  const deleteMutation = useMutation({
    mutationFn: (resourceId: string) =>
      resourceService.deleteResource(courseId!, resourceId),
    onSuccess: () => {
      toast({
        title: 'Resource deleted',
        description: 'The resource has been deleted successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['resources', courseId] });
      setResourceToDelete(null);
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete resource',
        variant: 'destructive',
      });
    },
  });

  const resetForm = () => {
    setFormData({
      title: '',
      type: 'PDF',
      order: resources.length + 1,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Create FormData for proper file upload handling
    const submitData = new FormData();
    
    submitData.append('title', formData.title);
    submitData.append('type', formData.type);
    submitData.append('course_id', courseId!);
    submitData.append('lesson_id', lessonId!);
    submitData.append('order', formData.order.toString());

    if (formData.type === 'LINK' && formData.file_url) {
      submitData.append('file_url', formData.file_url);
    }

    if (formData.type !== 'LINK' && formData.file) {
      submitData.append('file', formData.file);
    }

    if (editingResource) {
      updateMutation.mutate({ resourceId: editingResource.id, data: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const handleEdit = (resource: Resource) => {
    setEditingResource(resource);
    setFormData({
      title: resource.title,
      type: resource.type as 'PDF' | 'VIDEO' | 'AUDIO' | 'LINK' | 'OTHER',
      file_url: resource.file_url || '',
      order: resource.order,
    });
  };

  const handleCancelEdit = () => {
    setEditingResource(null);
    resetForm();
  };

  const handleDelete = (resource: Resource) => {
    setResourceToDelete(resource);
  };

  const confirmDelete = () => {
    if (resourceToDelete) {
      deleteMutation.mutate(resourceToDelete.id);
    }
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'PDF':
        return <FileText className="h-4 w-4" />;
      case 'VIDEO':
        return <Video className="h-4 w-4" />;
      case 'AUDIO':
        return <FileText className="h-4 w-4" />;
      case 'LINK':
        return <Link className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getTypeBadge = (type: string) => {
    const colors = {
      PDF: 'bg-blue-500',
      VIDEO: 'bg-purple-500',
      AUDIO: 'bg-green-500',
      LINK: 'bg-green-500',
    };
    return (
      <Badge className={colors[type as keyof typeof colors] || 'bg-gray-500'}>
        {getResourceIcon(type)}
        <span className="ml-1">{type}</span>
      </Badge>
    );
  };

  useEffect(() => {
    resetForm();
  }, [resources.length]);


  console.log(resources);


  if (!courseId || !lessonId) {
    return (
      <AdminLayout title="Resource Management">
        <div className="text-center py-8">
          <p className="text-red-500">Invalid course or lesson ID</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Resource Management">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => navigate(backUrl)}
              className="flex items-center"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Lessons
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Manage Resources</h1>
              <div className="flex items-center gap-2 text-muted-foreground">
                <span>Lesson:</span>
                <span className="font-medium">
                  {lesson?.lesson?.title || 'Loading lesson...'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Resource Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              {editingResource ? 'Edit Resource' : 'Add New Resource'}
              {editingResource && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancelEdit}
                  className="flex items-center"
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancel Edit
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    required
                    placeholder="Enter resource title"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Type *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: 'PDF' | 'VIDEO' | 'AUDIO' | 'LINK' | 'OTHER') =>
                      setFormData({ ...formData, type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PDF">PDF</SelectItem>
                      <SelectItem value="VIDEO">Video</SelectItem>
                      <SelectItem value="AUDIO">Audio</SelectItem>
                      <SelectItem value="LINK">Link</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {formData.type === 'LINK' ? (
                <div className="space-y-2">
                  <Label htmlFor="file_url">URL *</Label>
                  <Input
                    id="file_url"
                    type="url"
                    value={formData.file_url || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, file_url: e.target.value })
                    }
                    required
                    placeholder="https://example.com"
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="file">
                    File * {editingResource && '(Leave empty to keep current file)'}
                  </Label>
                  <Input
                    id="file"
                    type="file"
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        file: e.target.files?.[0],
                      })
                    }
                    required={!editingResource}
                    accept={
                      formData.type === 'VIDEO'
                        ? 'video/*'
                        : formData.type === 'AUDIO'
                        ? 'audio/*'
                        : '.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx'
                    }
                  />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="order">Order</Label>
                  <Input
                    id="order"
                    type="number"
                    min="1"
                    value={formData.order}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        order: parseInt(e.target.value) || 1,
                      })
                    }
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="flex items-center"
                >
                  {createMutation.isPending || updateMutation.isPending ? (
                    <Upload className="mr-2 h-4 w-4 animate-spin" />
                  ) : editingResource ? (
                    <Save className="mr-2 h-4 w-4" />
                  ) : (
                    <Plus className="mr-2 h-4 w-4" />
                  )}
                  {editingResource ? 'Update Resource' : 'Add Resource'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Resources List */}
        <Card>
          <CardHeader>
            <CardTitle>Resources ({resources.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="text-center py-8">Loading resources...</div>
            ) : error ? (
              <div className="text-center py-8 text-red-500">
                Error loading resources
              </div>
            ) : resources.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  No resources found for this lesson
                </p>
                <p className="text-sm text-muted-foreground">
                  Use the form above to add your first resource
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Order</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {resources
                    .sort((a, b) => a.order - b.order)
                    .map((resource) => (
                      <TableRow key={resource.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{resource.title}</p>
                          </div>
                        </TableCell>
                        <TableCell>{getTypeBadge(resource.type)}</TableCell>
                        <TableCell>{resource.order}</TableCell>
                        <TableCell>
                          {resource.file_size_formatted || 'N/A'}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {resource.file_url && (
                                <DropdownMenuItem asChild>
                                  <a
                                    href={resource.file_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center"
                                  >
                                    <Download className="mr-2 h-4 w-4" />
                                    Download
                                  </a>
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                onClick={() => handleEdit(resource)}
                                className="flex items-center"
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDelete(resource)}
                                className="flex items-center text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!resourceToDelete}
        onOpenChange={(open) => !open && setResourceToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              resource "{resourceToDelete?.title}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default ResourceManagementPage; 