import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useMutation } from '@tanstack/react-query';
import { userService } from '@/services/api/userService';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  Edit, 
  X, 
  User, 
  Mail, 
  Phone, 
  Home, 
  FileText, 
  Briefcase, 
  Building 
} from 'lucide-react';
import { useState } from 'react';

const adminFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  phone: z.string().optional(),
  address: z.string().optional(),
  bio: z.string().optional(),
  admin: z.object({
    department: z.string().optional(),
    position: z.string().optional(),
  }),
});

type AdminFormValues = z.infer<typeof adminFormSchema>;

const AdminProfileInformation = () => {
  const { toast } = useToast();
  const { user, refreshUserData } = useAuth();
  const [isEditMode, setIsEditMode] = useState(false);

  const form = useForm<AdminFormValues>({
    resolver: zodResolver(adminFormSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || '',
      bio: user?.bio || '',
      admin: {
        department: user?.admin?.department || '',
        position: user?.admin?.position || '',
      },
    },
  });

  const { mutate: updateProfile, isPending: isUpdating } = useMutation({
    mutationFn: (data: AdminFormValues) => userService.updateProfile(data),
    onSuccess: () => {
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
      refreshUserData();
      setIsEditMode(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    }
  });

  const onSubmit = (data: AdminFormValues) => {
    updateProfile(data);
  };

  const toggleEditMode = () => {
    if (isEditMode) {
      // If canceling edit mode, reset form to original values
      form.reset({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        address: user?.address || '',
        bio: user?.bio || '',
        admin: {
          department: user?.admin?.department || '',
          position: user?.admin?.position || '',
        },
      });
    }
    setIsEditMode(!isEditMode);
  };

  // Enhanced View mode field component with icons
  const ViewModeField = ({ 
    label, 
    value, 
    icon: Icon 
  }: { 
    label: string; 
    value?: string | number | null;
    icon: React.ComponentType<any>;
  }) => (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-1">
        <Icon className="h-4 w-4 text-gray-500" />
        <h4 className="text-sm font-medium text-gray-500">{label}</h4>
      </div>
      <p className="text-base pl-6">{value || '-'}</p>
    </div>
  );

  // Custom form field with icon
  const IconFormField = ({ 
    name, 
    label, 
    icon: Icon,
    type = "text",
    isTextarea = false,
    hint
  }: { 
    name: any; 
    label: string;
    icon: React.ComponentType<any>;
    type?: string;
    isTextarea?: boolean;
    hint?: string;
  }) => (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <div className="flex items-center gap-2 mb-1">
            <Icon className="h-4 w-4 text-gray-500" />
            <FormLabel className="mb-0">{label}</FormLabel>
          </div>
          <FormControl>
            <div className="pl-6">
              {isTextarea ? (
                <Textarea {...field} rows={4} />
              ) : (
                <Input {...field} type={type} />
              )}
            </div>
          </FormControl>
          {hint && <p className="text-sm text-gray-500 mt-1 pl-6">{hint}</p>}
          <FormMessage className="pl-6" />
        </FormItem>
      )}
    />
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Profile Information</h2>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">{isEditMode ? 'Edit Mode' : 'View Mode'}</span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={toggleEditMode}
            disabled={isUpdating}
          >
            {isEditMode ? (
              <>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </>
            ) : (
              <>
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </>
            )}
          </Button>
        </div>
      </div>

      {isEditMode ? (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <IconFormField name="name" label="Full Name" icon={User} />
                  <IconFormField name="email" label="Email" icon={Mail} type="email" />
                </div>

                <div className="mt-6">
                  <IconFormField 
                    name="bio" 
                    label="Bio" 
                    icon={FileText} 
                    isTextarea={true}
                    hint="Tell us a little about yourself."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <IconFormField name="phone" label="Phone" icon={Phone} />
                  <IconFormField name="address" label="Address" icon={Home} />
                </div>

                <Separator className="my-6" />
                
                <div className="flex items-center gap-2 mb-4">
                  <Briefcase className="h-5 w-5 text-gray-500" />
                  <h3 className="text-lg font-medium">Administrative Information</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <IconFormField name="admin.department" label="Department" icon={Building} />
                  <IconFormField name="admin.position" label="Position" icon={Briefcase} />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button type="submit" disabled={isUpdating}>
                {isUpdating ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </Form>
      ) : (
        /* View mode with icons */
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ViewModeField label="Full Name" value={user?.name} icon={User} />
                <ViewModeField label="Email" value={user?.email} icon={Mail} />
                <ViewModeField label="Phone" value={user?.phone} icon={Phone} />
                <ViewModeField label="Address" value={user?.address} icon={Home} />
              </div>
              
              <Separator className="my-4" />
              
              <ViewModeField label="Bio" value={user?.bio} icon={FileText} />
              
              <Separator className="my-4" />
              
              <div className="flex items-center gap-2 mb-4">
                <Briefcase className="h-5 w-5 text-gray-500" />
                <h3 className="text-lg font-medium">Administrative Information</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ViewModeField label="Department" value={user?.admin?.department} icon={Building} />
                <ViewModeField label="Position" value={user?.admin?.position} icon={Briefcase} />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdminProfileInformation;