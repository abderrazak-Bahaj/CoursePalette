import { Link } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ds/primitives/Card';
import { Button } from '@/components/ds/primitives/Button';
import { Alert } from '@/components/ds/primitives/Alert';
import { BookText, Users, BarChart3, GraduationCap } from 'lucide-react';

export interface AdminPanelProps {
  className?: string;
  systemAlert?: string;
}

const quickLinks = [
  {
    to: '/admin/courses',
    label: 'Courses',
    icon: <BookText className="w-5 h-5" />,
  },
  {
    to: '/admin/lessons',
    label: 'Lessons',
    icon: <GraduationCap className="w-5 h-5" />,
  },
  {
    to: '/admin/students',
    label: 'Students',
    icon: <Users className="w-5 h-5" />,
  },
  {
    to: '/admin/reports',
    label: 'Reports',
    icon: <BarChart3 className="w-5 h-5" />,
  },
];

export function AdminPanel({ className, systemAlert }: AdminPanelProps) {
  return (
    <div className={className}>
      {systemAlert && (
        <Alert variant="warning" description={systemAlert} className="mb-6" />
      )}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Admin Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickLinks.map(({ to, label, icon }) => (
              <Button
                key={to}
                variant="secondary"
                size="lg"
                asChild
                className="h-20 flex-col gap-2"
              >
                <Link to={to}>
                  {icon}
                  <span className="text-sm">{label}</span>
                </Link>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
