import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useDropzone } from 'react-dropzone';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';
import { userService } from '@/services/api/userService';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Camera, Upload, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Card, CardContent } from '@/components/ui/card';

// Max 3MB file size
const MAX_FILE_SIZE = 3 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];

const avatarFormSchema = z.object({
  avatar: z
    .instanceof(File)
    .refine((file) => file.size <= MAX_FILE_SIZE, `Max file size is 3MB.`)
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
      'Only .jpg, .jpeg, .png and .gif files are accepted.'
    )
    .optional(),
});

type AvatarFormValues = z.infer<typeof avatarFormSchema>;

const AvatarProfile = () => {
  const { user, refreshUserData } = useAuth();
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const form = useForm<AvatarFormValues>({
    resolver: zodResolver(avatarFormSchema),
    defaultValues: {
      avatar: undefined,
    },
  });
  
  const { mutate: updateAvatar, isPending: isUpdatingAvatar } = useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append('avatar', file);
      return userService.updateProfileAvatar(formData);
    },
    onSuccess: () => {
      toast({
        title: "Avatar updated",
        description: "Your profile avatar has been updated successfully.",
      });
      
      // Refresh user data to get the new avatar URL
      refreshUserData();
      
      // Close modal and reset form
      setIsModalOpen(false);
      setPreviewUrl(null);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update avatar. Please try again.",
        variant: "destructive",
      });
    }
  });

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      form.setValue('avatar', file);
      
      // Create preview URL
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ACCEPTED_IMAGE_TYPES,
    },
    maxSize: MAX_FILE_SIZE,
    multiple: false,
  });

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setPreviewUrl(null);
    form.reset();
  };

  const handleSubmit = form.handleSubmit((data) => {
    if (data.avatar) {
      updateAvatar(data.avatar);
    }
  });

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="flex-shrink-0">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="relative group">
                    <Avatar 
                      className="h-24 w-24 cursor-pointer border-2 border-transparent group-hover:border-primary/50 transition-all"
                      onClick={handleOpenModal}
                    >
                      <AvatarImage src={user?.avatar || ''} alt={user?.name || 'User'} />
                      <AvatarFallback className="bg-primary text-white text-lg">
                        {user?.name?.charAt(0) || 'U'}
                      </AvatarFallback>
                      <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera className="h-6 w-6 text-white" />
                      </div>
                    </Avatar>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Click to update your avatar</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div>
            <div className="space-y-2">
              <h3 className="text-lg font-medium">{user?.name}</h3>
              <p className="text-sm text-gray-500">{user?.email}</p>
              <p className="text-sm text-gray-500">{user?.role}</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleOpenModal}
                className="mt-2"
              >
                <Upload className="h-4 w-4 mr-2" />
                Change Photo
              </Button>
              <p className="text-xs text-gray-500">
                JPG, GIF or PNG. Max size 3MB.
              </p>
            </div>
          </div>
        </div>

        {/* Avatar Upload Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Update Profile Picture</DialogTitle>
              <DialogDescription>
                Upload a new profile picture. The image should be square for best results.
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div 
                  {...getRootProps()} 
                  className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                    isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary/50'
                  }`}
                >
                  <input {...getInputProps()} />
                  
                  {previewUrl ? (
                    <div className="flex flex-col items-center">
                      <div className="relative mb-4">
                        <img 
                          src={previewUrl} 
                          alt="Preview" 
                          className="w-32 h-32 rounded-full object-cover mx-auto"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive text-white"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviewUrl(null);
                            form.reset();
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-sm text-gray-500">Click or drag to replace</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <Camera className="h-10 w-10 text-gray-400 mb-2" />
                      <p className="text-sm font-medium mb-1">Drag and drop or click to upload</p>
                      <p className="text-xs text-gray-500">JPG, GIF or PNG (max. 3MB)</p>
                    </div>
                  )}
                </div>

                {form.formState.errors.avatar && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.avatar.message}
                  </p>
                )}

                <DialogFooter className="flex justify-between sm:justify-between">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleCloseModal}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isUpdatingAvatar || !previewUrl}
                  >
                    {isUpdatingAvatar ? 'Uploading...' : 'Update Avatar'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default AvatarProfile;
