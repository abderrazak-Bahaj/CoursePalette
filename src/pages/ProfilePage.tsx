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

const ProfilePage = () => {
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

    // Simulate API call
    setTimeout(() => {
      setIsUpdating(false);
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been updated successfully',
      });
    }, 1000);
  };

  return (
    <MainLayout>
      <div className="bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">Profile Settings</h1>

            <Tabs defaultValue="general">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-64 space-y-2">
                  <TabsList className="flex flex-col h-auto bg-transparent p-0 w-full">
                    <TabsTrigger
                      value="general"
                      className="justify-start px-4 py-2 w-full"
                    >
                      <User className="h-5 w-5 mr-2" />
                      General
                    </TabsTrigger>
                    <TabsTrigger
                      value="notifications"
                      className="justify-start px-4 py-2 w-full"
                    >
                      <Bell className="h-5 w-5 mr-2" />
                      Notifications
                    </TabsTrigger>
                    <TabsTrigger
                      value="security"
                      className="justify-start px-4 py-2 w-full"
                    >
                      <Lock className="h-5 w-5 mr-2" />
                      Security
                    </TabsTrigger>
                    <TabsTrigger
                      value="privacy"
                      className="justify-start px-4 py-2 w-full"
                    >
                      <FileText className="h-5 w-5 mr-2" />
                      Privacy
                    </TabsTrigger>
                  </TabsList>
                </div>

                <div className="flex-1">
                  <TabsContent value="general" className="m-0">
                    <Card>
                      <CardHeader>
                        <CardTitle>Profile Information</CardTitle>
                      </CardHeader>
                      <CardContent>
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
                              <Button
                                variant="outline"
                                size="sm"
                                className="mb-2"
                              >
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
                            <Button
                              onClick={handleSaveProfile}
                              disabled={isUpdating}
                            >
                              {isUpdating ? 'Saving...' : 'Save Changes'}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="notifications" className="m-0">
                    <Card>
                      <CardHeader>
                        <CardTitle>Notification Settings</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-6">
                          <div className="space-y-4">
                            <h3 className="font-medium">Email Notifications</h3>
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium">Course Updates</p>
                                  <p className="text-sm text-gray-500">
                                    Get notified when your enrolled courses are
                                    updated
                                  </p>
                                </div>
                                <Switch defaultChecked />
                              </div>
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium">New Lessons</p>
                                  <p className="text-sm text-gray-500">
                                    Get notified when new lessons are added to
                                    your courses
                                  </p>
                                </div>
                                <Switch defaultChecked />
                              </div>
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium">Promotions</p>
                                  <p className="text-sm text-gray-500">
                                    Receive promotional offers and discounts
                                  </p>
                                </div>
                                <Switch />
                              </div>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <h3 className="font-medium">
                              Platform Notifications
                            </h3>
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium">
                                    Certificate Earned
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    Get notified when you earn a new certificate
                                  </p>
                                </div>
                                <Switch defaultChecked />
                              </div>
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium">
                                    Course Reminders
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    Reminders to continue your learning
                                  </p>
                                </div>
                                <Switch defaultChecked />
                              </div>
                            </div>
                          </div>

                          <div className="flex justify-end">
                            <Button>Save Preferences</Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="security" className="m-0">
                    <Card>
                      <CardHeader>
                        <CardTitle>Security Settings</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-6">
                          <div>
                            <h3 className="font-medium mb-4">
                              Change Password
                            </h3>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="currentPassword">
                                  Current Password
                                </Label>
                                <Input
                                  id="currentPassword"
                                  type="password"
                                  placeholder="Enter your current password"
                                />
                              </div>
                              <div>
                                <Label htmlFor="newPassword">
                                  New Password
                                </Label>
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

                          <div className="space-y-4">
                            <h3 className="font-medium mb-2">
                              Two-Factor Authentication
                            </h3>
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
                                  Manage your active sessions and sign out from
                                  other devices
                                </p>
                              </div>
                              <Button variant="outline">Manage Sessions</Button>
                            </div>
                          </div>

                          <div className="flex justify-end">
                            <Button>Update Security</Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="privacy" className="m-0">
                    <Card>
                      <CardHeader>
                        <CardTitle>Privacy Settings</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-6">
                          <div className="space-y-4">
                            <h3 className="font-medium">Profile Visibility</h3>
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium">Public Profile</p>
                                  <p className="text-sm text-gray-500">
                                    Allow others to view your profile
                                    information
                                  </p>
                                </div>
                                <Switch defaultChecked />
                              </div>
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium">Show Courses</p>
                                  <p className="text-sm text-gray-500">
                                    Show your enrolled courses on your profile
                                  </p>
                                </div>
                                <Switch defaultChecked />
                              </div>
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium">
                                    Show Certificates
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    Make your earned certificates visible to
                                    others
                                  </p>
                                </div>
                                <Switch defaultChecked />
                              </div>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <h3 className="font-medium">Data Usage</h3>
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium">Learning Data</p>
                                  <p className="text-sm text-gray-500">
                                    Allow us to analyze your learning patterns
                                    to improve recommendations
                                  </p>
                                </div>
                                <Switch defaultChecked />
                              </div>
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium">
                                    Cookie Preferences
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    Manage how we use cookies to enhance your
                                    experience
                                  </p>
                                </div>
                                <Button variant="outline" size="sm">
                                  Manage Cookies
                                </Button>
                              </div>
                            </div>
                          </div>

                          <div>
                            <h3 className="font-medium mb-2">Account Data</h3>
                            <div className="space-y-2">
                              <Button variant="outline" size="sm">
                                Download My Data
                              </Button>
                              <p className="text-sm text-gray-500">
                                Get a copy of all your personal data
                              </p>
                            </div>
                          </div>

                          <div className="flex justify-end">
                            <Button>Save Privacy Settings</Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </div>
              </div>
            </Tabs>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ProfilePage;
