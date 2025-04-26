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

const AdminProfilePage = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [isUpdating, setIsUpdating] = useState(false);

  // Form fields
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: 'Learning enthusiast passionate about web development and data science.',
    location: 'San Francisco, CA',
    website: 'https://johndoe.com',
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSaveProfile = () => {
    setIsUpdating(true);

    setTimeout(() => {
      setIsUpdating(false);
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been updated successfully',
      });
    }, 1000);
  };

  return (
    <AdminLayout>
      <div className=" mx-auto">
        <h1 className="text-3xl font-bold mb-8">Profile Settings</h1>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center gap-6">
                <div className="flex-shrink-0">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={user?.profileUrl} />
                    <AvatarFallback className="bg-course-blue text-white text-lg">
                      {user?.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div>
                  <Button variant="outline" size="sm" className="mb-2">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload new image
                  </Button>
                  <p className="text-sm text-gray-500">
                    JPG, GIF or PNG. Max size 2MB.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows={4}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Tell us a little about yourself.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveProfile} disabled={isUpdating}>
                  {isUpdating ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminProfilePage;
