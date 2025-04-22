import { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Upload, User, Bell, Lock, FileText } from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';

const AdminSecurity = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  return (
    <AdminLayout>
      <div className="mx-auto">
        <h1 className="text-3xl font-bold mb-8">Security Settings</h1>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-6">
              <div>
                <h3 className="font-medium mb-4">Change Password</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      placeholder="Enter your current password"
                    />
                  </div>
                  <div>
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      placeholder="Enter your new password"
                    />
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword">
                      Confirm New Password
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm your new password"
                    />
                  </div>
                </div>
              </div>

              {/*   <div className="space-y-4">
                <h3 className="font-medium mb-2">Two-Factor Authentication</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <Button variant="outline">Set Up</Button>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium mb-2">Sessions</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">
                      Manage your active sessions and sign out from other
                      devices
                    </p>
                  </div>
                  <Button variant="outline">Manage Sessions</Button>
                </div>
              </div> */}

              <div className="flex justify-end">
                <Button>Update Security</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminSecurity;
