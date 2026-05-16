import { Avatar } from '@/components/ds/primitives/Avatar';
import { Badge } from '@/components/ds/primitives/Badge';
import { Button } from '@/components/ds/primitives/Button';

export interface UserRow {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'TEACHER' | 'STUDENT';
  status?: 'active' | 'inactive';
  avatar?: string;
}

export interface UsersTableProps {
  users: UserRow[];
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const roleVariantMap = {
  ADMIN: 'primary',
  TEACHER: 'action',
  STUDENT: 'success',
} as const;

const roleAvatarMap = {
  ADMIN: 'admin',
  TEACHER: 'teacher',
  STUDENT: 'student',
} as const;

export function UsersTable({ users, onEdit, onDelete }: UsersTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-neutral-700">
            <th className="text-left py-3 px-4 text-neutral-400 font-medium">
              User
            </th>
            <th className="text-left py-3 px-4 text-neutral-400 font-medium">
              Role
            </th>
            <th className="text-left py-3 px-4 text-neutral-400 font-medium">
              Status
            </th>
            <th className="text-right py-3 px-4 text-neutral-400 font-medium">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr
              key={user.id}
              className="border-b border-neutral-800 hover:bg-neutral-800/30 transition-colors"
            >
              <td className="py-3 px-4">
                <div className="flex items-center gap-3">
                  <Avatar
                    src={user.avatar}
                    alt={user.name}
                    fallback={user.name.slice(0, 2)}
                    size="sm"
                    role={roleAvatarMap[user.role]}
                  />
                  <div>
                    <p className="font-medium text-neutral-100">{user.name}</p>
                    <p className="text-xs text-neutral-500">{user.email}</p>
                  </div>
                </div>
              </td>
              <td className="py-3 px-4">
                <Badge variant={roleVariantMap[user.role]} size="sm">
                  {user.role}
                </Badge>
              </td>
              <td className="py-3 px-4">
                <Badge
                  variant={user.status === 'active' ? 'success' : 'default'}
                  size="sm"
                >
                  {user.status ?? 'active'}
                </Badge>
              </td>
              <td className="py-3 px-4 text-right">
                <div className="flex items-center justify-end gap-1">
                  {onEdit && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(user.id)}
                    >
                      Edit
                    </Button>
                  )}
                  {onDelete && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => onDelete(user.id)}
                    >
                      Delete
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
