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
  UsersRound,
  User,
  Lock,
  File,
  Files,
} from 'lucide-react';
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

interface AdminLayoutProps {
  children: ReactNode;
  title?: string;
}

const AdminLayout = ({ children, title }: AdminLayoutProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

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

  const handleClickLink = (
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
    to: string
  ) => {
    e.preventDefault();
    navigate(to);
  };

  const baseLinks = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: <LayoutDashboard /> },
    { to: '/admin/courses', label: 'Courses', icon: <FolderKanban /> },
    { to: '/admin/lessons', label: 'Lessons', icon: <BookText /> },
  ];

  const newink =  (user?.role === 'ADMIN')? 
  { to: '/admin/all-invoices', label: 'All Invoices', icon: <Files /> } :  
  { to: '/admin/invoices', label: 'Invoices', icon: <File /> }

  const adminLinks = [
    { to: '/admin/instructors', label: 'Instructors', icon: <UsersRound /> },
    { to: '/admin/students', label: 'Students', icon: <Users /> },
    { to: '/admin/categories', label: 'Categories', icon: <FolderKanban /> },
    newink
/*     { to: '/admin/reports', label: 'Reports', icon: <BarChart3 /> },
 */  ];

  const mainLinks = [
    ...baseLinks,
    ...(user?.role === 'ADMIN' ? adminLinks : []),
  ];

  const accountLinks = [
    { to: '/admin/profile', label: 'Profile', icon: <User /> },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
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
                  {mainLinks.map(({ to, label, icon }) => (
                    <SidebarMenuItem key={to}>
                      <SidebarMenuButton asChild tooltip={label}>
                        <a
                          href={to}
                          onClick={(e) => handleClickLink(e, to)}
                          className="flex items-center p-2 text-gray-900 rounded-lg hover:bg-gray-100"
                        >
                          {icon}
                          <span>{label}</span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroup>

              <SidebarGroup>
                <SidebarGroupLabel> Account Settings</SidebarGroupLabel>
                <SidebarMenu>
                  {accountLinks.map(({ to, label, icon, children }) => (
                    <SidebarMenuItem key={to}>
                      <SidebarMenuButton asChild tooltip={label}>
                        <a
                          href={to}
                          onClick={(e) => handleClickLink(e, to)}
                          className="flex items-center p-2 text-gray-900 rounded-lg hover:bg-gray-100"
                        >
                          {icon}
                          <span>{label}</span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
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
                <p className="mt-1">Role: {user?.role}</p>
              </div>
            </SidebarFooter>
          </Sidebar>
          <SidebarInset className="flex flex-col">
            <div className="flex-1 px-4 py-6 md:px-6 md:py-8">
              <div className="mb-6">
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
                  <SidebarTrigger />
                </div>
              </div>
              <main>{children}</main>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default AdminLayout;
