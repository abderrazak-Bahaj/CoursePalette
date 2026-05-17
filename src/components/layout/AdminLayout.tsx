import { ReactNode, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  BookText,
  LayoutDashboard,
  FolderKanban,
  Users,
  LogOut,
  UsersRound,
  User,
  File,
  Files,
  GraduationCap,
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

const AdminLayoutInner = ({ children, title }: AdminLayoutProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { setSidebarCollapsed } = useCustomSidebar();
  const { state: sidebarState } = useUISidebar();

  useEffect(() => {
    setSidebarCollapsed(sidebarState === 'collapsed');
  }, [sidebarState, setSidebarCollapsed]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
      toast({
        title: 'Logged out successfully',
        description: 'You have been logged out of your account',
      });
    } catch {
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
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/courses', label: 'Courses', icon: FolderKanban },
    { to: '/admin/lessons', label: 'Lessons', icon: BookText },
  ];

  const invoiceLink =
    user?.role === 'ADMIN'
      ? { to: '/admin/all-invoices', label: 'All Invoices', icon: Files }
      : { to: '/admin/invoices', label: 'Invoices', icon: File };

  const adminLinks = [
    { to: '/admin/instructors', label: 'Instructors', icon: UsersRound },
    { to: '/admin/students', label: 'Students', icon: Users },
    { to: '/admin/categories', label: 'Categories', icon: FolderKanban },
    invoiceLink,
  ];

  const mainLinks = [
    ...baseLinks,
    ...(user?.role === 'ADMIN' ? adminLinks : []),
  ];

  const accountLinks = [{ to: '/admin/profile', label: 'Profile', icon: User }];

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
        collapsible="icon"
        className="border-r border-[#1e293b] bg-[#0c1222]"
      >
        {/* Logo */}
        <SidebarHeader className="border-b border-white/5 px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-violet-700 shadow-lg shadow-violet-500/20">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <div className="group-data-[collapsible=icon]:hidden">
              <span className="text-sm font-bold text-neutral-50 tracking-tight">
                CoursePalette
              </span>
              <p className="text-[10px] text-neutral-500">
                {user?.role === 'ADMIN' ? 'Admin Panel' : 'Teacher Panel'}
              </p>
            </div>
          </div>
        </SidebarHeader>

        {/* Navigation */}
        <SidebarContent className="px-3 py-4">
          <SidebarGroup>
            <SidebarGroupLabel className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-neutral-500 group-data-[collapsible=icon]:hidden">
              Navigation
            </SidebarGroupLabel>
            <SidebarMenu className="space-y-1">
              {mainLinks.map(({ to, label, icon: Icon }) => (
                <SidebarMenuItem key={to}>
                  <SidebarMenuButton asChild tooltip={label}>
                    <a
                      href={to}
                      onClick={(e) => handleClickLink(e, to)}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
                        isActive(to)
                          ? 'bg-violet-500/15 text-violet-400 shadow-sm shadow-violet-500/5'
                          : 'text-neutral-400 hover:bg-white/5 hover:text-neutral-200'
                      )}
                    >
                      <Icon
                        className={cn(
                          'h-4 w-4 shrink-0',
                          isActive(to) ? 'text-violet-400' : 'text-neutral-500'
                        )}
                      />
                      <span className="group-data-[collapsible=icon]:hidden">
                        {label}
                      </span>
                      {isActive(to) && (
                        <span className="ml-auto h-1.5 w-1.5 rounded-full bg-violet-400 group-data-[collapsible=icon]:hidden" />
                      )}
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>

          <SidebarGroup className="mt-6">
            <SidebarGroupLabel className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-neutral-500 group-data-[collapsible=icon]:hidden">
              Account
            </SidebarGroupLabel>
            <SidebarMenu className="space-y-1">
              {accountLinks.map(({ to, label, icon: Icon }) => (
                <SidebarMenuItem key={to}>
                  <SidebarMenuButton asChild tooltip={label}>
                    <a
                      href={to}
                      onClick={(e) => handleClickLink(e, to)}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
                        isActive(to)
                          ? 'bg-violet-500/15 text-violet-400'
                          : 'text-neutral-400 hover:bg-white/5 hover:text-neutral-200'
                      )}
                    >
                      <Icon
                        className={cn(
                          'h-4 w-4 shrink-0',
                          isActive(to) ? 'text-violet-400' : 'text-neutral-500'
                        )}
                      />
                      <span className="group-data-[collapsible=icon]:hidden">
                        {label}
                      </span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={handleLogout}
                  tooltip="Logout"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-neutral-400 transition-all duration-200 hover:bg-red-500/10 hover:text-red-400"
                >
                  <LogOut className="h-4 w-4 shrink-0 text-neutral-500" />
                  <span className="group-data-[collapsible=icon]:hidden">
                    Logout
                  </span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>

        {/* User card */}
        <SidebarFooter className="border-t border-white/5 p-3">
          <div className="flex items-center gap-3 rounded-lg bg-white/[0.03] px-3 py-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-500/20 to-violet-600/20 ring-1 ring-violet-500/20">
              <span className="text-xs font-semibold text-violet-400">
                {user?.name?.charAt(0)?.toUpperCase()}
              </span>
            </div>
            <div className="group-data-[collapsible=icon]:hidden min-w-0">
              <p className="text-xs font-medium text-neutral-200 truncate">
                {user?.name}
              </p>
              <p className="text-[10px] text-neutral-500 capitalize">
                {user?.role?.toLowerCase()}
              </p>
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>

      {/* Main content */}
      <SidebarInset className="flex flex-col bg-[#0f172a]">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-white/5 bg-[#0f172a]/80 backdrop-blur-sm px-6 py-4">
          <div className="flex items-center gap-3">
            <SidebarTrigger className="text-neutral-400 hover:text-neutral-200" />
            {title && (
              <h1 className="text-lg font-semibold text-neutral-50">{title}</h1>
            )}
          </div>
        </header>
        <main className="flex-1 px-6 py-6">
          <ErrorBoundary>{children}</ErrorBoundary>
        </main>
      </SidebarInset>
    </div>
  );
};

const AdminLayout = ({ children, title }: AdminLayoutProps) => {
  const { isCollapsed } = useCustomSidebar();

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-[#0f172a]">
        <UISidebarProvider defaultOpen={!isCollapsed}>
          <AdminLayoutInner title={title}>{children}</AdminLayoutInner>
        </UISidebarProvider>
      </div>
    </ErrorBoundary>
  );
};

export default AdminLayout;
