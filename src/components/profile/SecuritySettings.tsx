import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Lock, Smartphone, Shield } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/,
        'Password must contain at least one uppercase letter, one lowercase letter, and one number'
      ),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type PasswordFormData = z.infer<typeof passwordSchema>;

const SecuritySettings = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: PasswordFormData) => {
    setIsSubmitting(true);

    try {
      // API call would go here
      console.log('Changing password:', data);

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast({
        title: 'Password Updated',
        description: 'Your password has been updated successfully',
      });

      // Reset form
      form.reset();
    } catch (error) {
      console.error('Error updating password:', error);
      toast({
        title: 'Update Failed',
        description: 'There was a problem updating your password',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Security Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-medium flex items-center">
            <Lock className="mr-2 h-5 w-5 text-gray-500" />
            Change Password
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Update your password to keep your account secure
          </p>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                {...form.register('currentPassword')}
                placeholder="Enter your current password"
              />
              {form.formState.errors.currentPassword && (
                <p className="text-sm text-red-500 mt-1">
                  {form.formState.errors.currentPassword.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                {...form.register('newPassword')}
                placeholder="Enter your new password"
              />
              {form.formState.errors.newPassword && (
                <p className="text-sm text-red-500 mt-1">
                  {form.formState.errors.newPassword.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                {...form.register('confirmPassword')}
                placeholder="Confirm your new password"
              />
              {form.formState.errors.confirmPassword && (
                <p className="text-sm text-red-500 mt-1">
                  {form.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>

            <div>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSubmitting ? 'Updating...' : 'Update Password'}
              </Button>
            </div>
          </form>
        </div>

        <Separator />

      {/*   <div>
          <h3 className="text-lg font-medium flex items-center">
            <Smartphone className="mr-2 h-5 w-5 text-gray-500" />
            Two-Factor Authentication
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Add an extra layer of security to your account
          </p>
          <Button variant="outline">Set Up 2FA</Button>
        </div>

        <Separator />

        <div>
          <h3 className="text-lg font-medium flex items-center">
            <Shield className="mr-2 h-5 w-5 text-gray-500" />
            Active Sessions
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Manage your active sessions and sign out from other devices
          </p>
          <Button variant="outline">Manage Sessions</Button>
        </div> */}
      </CardContent>
    </Card>
  );
};

export default SecuritySettings; 