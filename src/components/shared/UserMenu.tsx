// src/components/shared/UserMenu.tsx
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar } from '@/components/ds/primitives/Avatar';
import { Separator } from '@/components/ds/primitives/Separator';
import { User, LayoutDashboard, Award, Settings, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export function UserMenu() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  if (!user) return null;

  const roleMap = {
    ADMIN: 'admin' as const,
    TEACHER: 'teacher' as const,
    STUDENT: 'student' as const,
  };

  const userRole = roleMap[user.role as keyof typeof roleMap];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="focus-visible:outline-none focus-visible:shadow-glow-violet rounded-full"
          aria-label="User menu"
        >
          <Avatar
            src={user.avatar ?? undefined}
            alt={user.name}
            fallback={user.name?.slice(0, 2)}
            size="md"
            role={userRole}
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-56 bg-[#1e293b] border border-neutral-700 text-neutral-100 rounded-lg shadow-lg p-1"
      >
        <div className="px-3 py-2">
          <p className="text-sm font-medium text-neutral-100">{user.name}</p>
          <p className="text-xs text-neutral-400">{user.email}</p>
        </div>
        <Separator className="my-1" />
        <DropdownMenuItem
          onClick={() => navigate('/profile')}
          className="flex items-center gap-2 px-3 py-2 text-sm text-neutral-200 hover:bg-neutral-700/50 rounded-md cursor-pointer"
        >
          <User className="w-4 h-4" />
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => navigate('/settings')}
          className="flex items-center gap-2 px-3 py-2 text-sm text-neutral-200 hover:bg-neutral-700/50 rounded-md cursor-pointer"
        >
          <Settings className="w-4 h-4" />
          Settings
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 px-3 py-2 text-sm text-neutral-200 hover:bg-neutral-700/50 rounded-md cursor-pointer"
        >
          <LayoutDashboard className="w-4 h-4" />
          Dashboard
        </DropdownMenuItem>
        {user.role === 'STUDENT' && (
          <DropdownMenuItem
            onClick={() => navigate('/certificates')}
            className="flex items-center gap-2 px-3 py-2 text-sm text-neutral-200 hover:bg-neutral-700/50 rounded-md cursor-pointer"
          >
            <Award className="w-4 h-4" />
            Certificates
          </DropdownMenuItem>
        )}
        <Separator className="my-1" />
        <DropdownMenuItem
          onClick={logout}
          className="flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-900/20 rounded-md cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
