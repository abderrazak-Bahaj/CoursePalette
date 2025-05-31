import { ReactNode, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  ClipboardList,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useSidebar as useCustomSidebar } from '@/contexts/SidebarContext';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import {
  SidebarProvider as UISidebarProvider,
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
  useSidebar as useUISidebar,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

interface AdminLayoutProps {
  children: ReactNode;
  title?: string;
}

// Inner component that has access to UI sidebar context
const AdminLayoutInner = ({ children, title }: AdminLayoutProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { isCollapsed, setSidebarCollapsed } = useCustomSidebar();
  const { state: sidebarState } = useUISidebar();

  // Sync UI sidebar state with our context
  useEffect(() => {
    if (sidebarState === 'collapsed') {
      setSidebarCollapsed(true);
    } else {
      setSidebarCollapsed(false);
    }
  }, [sidebarState, setSidebarCollapsed]);

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

  const newink = (user?.role === 'ADMIN')
    ? { to: '/admin/all-invoices', label: 'All Invoices', icon: <Files /> }
    : { to: '/admin/invoices', label: 'Invoices', icon: <File /> };

  const adminLinks = [
    { to: '/admin/instructors', label: 'Instructors', icon: <UsersRound /> },
    { to: '/admin/students', label: 'Students', icon: <Users /> },
    { to: '/admin/categories', label: 'Categories', icon: <FolderKanban /> },
    newink
  ];

  const mainLinks = [
    ...baseLinks,
    ...(user?.role === 'ADMIN' ? adminLinks : []),
  ];

  const accountLinks = [
    { to: '/admin/profile', label: 'Profile', icon: <User /> },
  ];

  const isActive = (path: string) => {
    if (path === '/admin/dashboard') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
        <div className="flex min-h-screen w-full">
      <Sidebar 
        variant="inset" 
        className="border-r bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-slate-100"
        collapsible="icon"
      >
            <SidebarHeader className="border-b border-slate-800/50">
              <div className="flex items-center gap-2 px-4 py-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shadow-lg shadow-primary/20">
                  <BookText className="h-4 w-4 text-primary-foreground" />
                </div>
            <div className="group-data-[collapsible=icon]:hidden">
                  <span className="text-sm font-semibold tracking-tight">ELearning</span>
                  <p className="text-[10px] text-slate-400">Admin Portal</p>
                </div>
              </div>
            </SidebarHeader>
            <SidebarContent className="px-2 py-3">
              <SidebarGroup>
            <SidebarGroupLabel className="px-2 text-[10px] font-medium text-slate-400 group-data-[collapsible=icon]:hidden">
                  Main Navigation
                </SidebarGroupLabel>
                <SidebarMenu className="mt-1 space-y-0.5">
                  {mainLinks.map(({ to, label, icon }) => (
                    <SidebarMenuItem key={to}>
                      <SidebarMenuButton asChild tooltip={label}>
                        <a
                          href={to}
                          onClick={(e) => handleClickLink(e, to)}
                          className={cn(
                            "flex items-center gap-2 rounded-md px-2 py-1.5 text-xs font-medium transition-colors",
                            "hover:bg-white/10 hover:text-slate-100",
                            "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-700",
                            isActive(to) && "bg-white/10 text-slate-100 border-l-2 border-primary"
                          )}
                        >
                          <span className={cn("text-slate-400", isActive(to) && "text-primary")}>{icon}</span>
                      <span className="group-data-[collapsible=icon]:hidden">{label}</span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroup>

              <SidebarGroup className="mt-4">
            <SidebarGroupLabel className="px-2 text-[10px] font-medium text-slate-400 group-data-[collapsible=icon]:hidden">
                  Account Settings
                </SidebarGroupLabel>
                <SidebarMenu className="mt-1 space-y-0.5">
                  {accountLinks.map(({ to, label, icon }) => (
                    <SidebarMenuItem key={to}>
                      <SidebarMenuButton asChild tooltip={label}>
                        <a
                          href={to}
                          onClick={(e) => handleClickLink(e, to)}
                          className={cn(
                            "flex items-center gap-2 rounded-md px-2 py-1.5 text-xs font-medium transition-colors",
                            "hover:bg-white/10 hover:text-slate-100",
                            "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-700",
                            isActive(to) && "bg-white/10 text-slate-100 border-l-2 border-primary"
                          )}
                        >
                          <span className={cn("text-slate-400", isActive(to) && "text-primary")}>{icon}</span>
                      <span className="group-data-[collapsible=icon]:hidden">{label}</span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={handleLogout}
                      tooltip="Logout"
                      className={cn(
                        "flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                        "hover:bg-red-500/10 hover:text-red-400",
                        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-700"
                      )}
                    >
                      <LogOut className="h-3.5 w-3.5" />
                  <span className="group-data-[collapsible=icon]:hidden">Logout</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="border-t border-slate-800/50">
              <div className="bg-white p-3 rounded-t-lg">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20">
                    <span className="text-xs font-medium text-primary">
                      {user?.name?.charAt(0)}
                    </span>
                  </div>
              <div className="group-data-[collapsible=icon]:hidden">
                    <p className="text-xs font-medium text-slate-900">{user?.name}</p>
                    <p className="text-[10px] text-slate-500 capitalize">{user?.role?.toLowerCase()}</p>
                  </div>
                </div>
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
          <main>
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
          </main>
        </div>
      </SidebarInset>
    </div>
  );
};

const AdminLayout = ({ children, title }: AdminLayoutProps) => {
  const { isCollapsed } = useCustomSidebar();

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background">
        <UISidebarProvider defaultOpen={!isCollapsed}>
          <AdminLayoutInner title={title}>
            {children}
          </AdminLayoutInner>
        </UISidebarProvider>
      </div>
    </ErrorBoundary>
  );
};

export default AdminLayout;
