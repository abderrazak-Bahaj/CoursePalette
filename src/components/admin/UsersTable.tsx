import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MoreHorizontal, Search, PlusCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { AddUserModal } from './AddUserModal';
import { ResetPasswordModal } from './ResetPasswordModal';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'instructor' | 'admin';
  status: 'active' | 'inactive';
  lastLogin?: string;
}

interface UsersTableProps {
  users: User[];
  onAddUser: (userData: {
    name: string;
    email: string;
    role: string;
  }) => Promise<void>;
  onResetPassword: (userId: string) => Promise<void>;
  onUpdateUserStatus: (
    userId: string,
    status: 'active' | 'inactive'
  ) => Promise<void>;
  isLoading: boolean;
}

export function UsersTable({
  users,
  onAddUser,
  onResetPassword,
  onUpdateUserStatus,
  isLoading,
}: UsersTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [addUserModalOpen, setAddUserModalOpen] = useState(false);
  const [resetPasswordModalOpen, setResetPasswordModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePasswordReset = async (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (user) {
      setSelectedUser(user);
      setResetPasswordModalOpen(true);
    }
  };

  const handleStatusChange = async (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (user) {
      const newStatus = user.status === 'active' ? 'inactive' : 'active';
      await onUpdateUserStatus(userId, newStatus);
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'instructor':
        return 'default';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="relative w-72">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button onClick={() => setAddUserModalOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Login</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-6 text-muted-foreground"
                >
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={getRoleBadgeVariant(user.role)}>
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        user.status === 'active' ? 'outline' : 'secondary'
                      }
                    >
                      {user.status === 'active' ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>{user.lastLogin || 'Never'}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handlePasswordReset(user.id)}
                        >
                          Reset password
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleStatusChange(user.id)}
                        >
                          {user.status === 'active' ? 'Deactivate' : 'Activate'}{' '}
                          user
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AddUserModal
        isOpen={addUserModalOpen}
        onOpenChange={setAddUserModalOpen}
        onAddUser={async (userData) => {
          await onAddUser(userData);
          setAddUserModalOpen(false);
        }}
        isLoading={isLoading}
      />

      {selectedUser && (
        <ResetPasswordModal
          isOpen={resetPasswordModalOpen}
          onOpenChange={setResetPasswordModalOpen}
          userName={selectedUser.name}
          onResetPassword={async () => {
            await onResetPassword(selectedUser.id);
            setResetPasswordModalOpen(false);
          }}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}
