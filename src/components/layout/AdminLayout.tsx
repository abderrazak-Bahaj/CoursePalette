import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookText,
  LayoutDashboard,
  FolderKanban,
  Users,
  BarChart3,
  Settings,
  LogOut,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
} from '@/components/ui/sidebar';
import Navbar from './Navbar';
import Footer from './Footer';

interface AdminLayoutProps {
  children: ReactNode;
  title?: string;
}

const AdminLayout = ({ children, title = 'Dashboard' }: AdminLayoutProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  //const title = useGetTitle()

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
      toast({
        title: 'Logged out successfully',
        description: 'You have been logged out of your account',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to log out. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <Sidebar variant="inset">
            <SidebarHeader>
              <div className="flex items-center gap-2 px-4 py-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
                  <BookText className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="text-lg font-bold">ELearning Admin</span>
              </div>
            </SidebarHeader>
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupLabel>Main Navigation</SidebarGroupLabel>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="Dashboard">
                      <a href="/dashboard">
                        <LayoutDashboard />
                        <span>Dashboard</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="Courses">
                      <a href="/admin/courses">
                        <FolderKanban />
                        <span>Courses</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="Lessons">
                      <a href="/admin/lessons">
                        <BookText />
                        <span>Lessons</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="Students">
                      <a href="/admin/students">
                        <Users />
                        <span>Students</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="Reports">
                      <a href="/admin/reports">
                        <BarChart3 />
                        <span>Reports</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroup>

              <SidebarGroup>
                <SidebarGroupLabel>Account</SidebarGroupLabel>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="Settings">
                      <a href="/profile">
                        <Settings />
                        <span>Settings</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={handleLogout} tooltip="Logout">
                      <LogOut />
                      <span>Logout</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
              <div className="p-4 text-xs text-muted-foreground">
                <p>Logged in as: {user?.name}</p>
                <p className="mt-1">Role: Administrator</p>
              </div>
            </SidebarFooter>
          </Sidebar>
          <SidebarInset className="flex flex-col">
            <Navbar />
            <div className="flex-1 px-4 py-6 md:px-6 md:py-8">
              <div className="mb-6">
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
                  <SidebarTrigger />
                </div>
              </div>
              <main>{children}</main>
            </div>
            <Footer />
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default AdminLayout;
