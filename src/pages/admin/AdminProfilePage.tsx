import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import AdminLayout from '@/components/layout/AdminLayout';
import TeacherProfileInformation from '@/components/profile/TeacherProfileInformation';
import AdminProfileInformation from '@/components/profile/AdminProfileInformation';
import AvatarProfile from '@/components/profile/AvatarProfile';
import SecuritySettings from '@/components/profile/SecuritySettings';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const AdminProfilePage = () => {
  const { isAdmin } = useAuth();

  const profileContent = isAdmin ? (
    <AdminProfileInformation />
  ) : (
    <TeacherProfileInformation />
  );

  return (
    <AdminLayout>
      <div className="mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">My Profile</h1>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="profile">Profile Information</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            {isAdmin && (
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <AvatarProfile />
            {profileContent}
          </TabsContent>

          <TabsContent value="security">
            <SecuritySettings />
          </TabsContent>

          {isAdmin && (
            <TabsContent value="preferences">
              <Card>
                <CardContent className="pt-6">
                  <h2 className="text-2xl font-bold mb-4">User Preferences</h2>
                  <p className="text-gray-500">
                    Notification settings and preferences will be available
                    here.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminProfilePage;
