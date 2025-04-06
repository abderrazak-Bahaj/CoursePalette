import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Search,
  Download,
  Filter,
  Star,
  UserPlus,
  FileEdit,
  Trash2,
  EyeIcon,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const mockInstructors = [
  {
    id: 1,
    name: 'Dr. Alex Johnson',
    email: 'alex.johnson@example.com',
    specialty: 'Web Development',
    courses: 12,
    students: 450,
    rating: 4.8,
    status: 'active',
    avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
  },
  {
    id: 2,
    name: 'Prof. Sarah Williams',
    email: 'sarah.williams@example.com',
    specialty: 'Data Science',
    courses: 8,
    students: 320,
    rating: 4.9,
    status: 'active',
    avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
  },
  {
    id: 3,
    name: 'Dr. Michael Chen',
    email: 'michael.chen@example.com',
    specialty: 'Machine Learning',
    courses: 10,
    students: 380,
    rating: 4.7,
    status: 'on leave',
    avatar: 'https://randomuser.me/api/portraits/men/3.jpg',
  },
  {
    id: 4,
    name: 'Prof. Lisa Roberts',
    email: 'lisa.roberts@example.com',
    specialty: 'UX Design',
    courses: 6,
    students: 290,
    rating: 4.6,
    status: 'active',
    avatar: 'https://randomuser.me/api/portraits/women/4.jpg',
  },
  {
    id: 5,
    name: 'Dr. James Wilson',
    email: 'james.wilson@example.com',
    specialty: 'Mobile Development',
    courses: 9,
    students: 410,
    rating: 4.9,
    status: 'active',
    avatar: 'https://randomuser.me/api/portraits/men/5.jpg',
  },
  {
    id: 6,
    name: 'Prof. Maria Garcia',
    email: 'maria.garcia@example.com',
    specialty: 'Cloud Computing',
    courses: 7,
    students: 340,
    rating: 4.8,
    status: 'inactive',
    avatar: 'https://randomuser.me/api/portraits/women/6.jpg',
  },
];

const InstructorsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuth();
  const { toast } = useToast();

  const filteredInstructors = mockInstructors.filter(
    (instructor) =>
      instructor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      instructor.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      instructor.specialty.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      case 'on leave':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const handleAction = (action: string, id: number, name: string) => {
    toast({
      title: `${action} instructor`,
      description: `You ${action.toLowerCase()}ed instructor ${name}`,
    });
  };

  // Only render with AdminLayout if user is admin, fallback to normal view for others
  const LayoutComponent = user?.isAdmin ? AdminLayout : 'div';
  const layoutProps = user?.isAdmin ? { title: 'Manage Instructors' } : {};

  return (
    <LayoutComponent {...layoutProps}>
      <div className="container mx-auto px-4 py-8">
        {!user?.isAdmin && (
          <h1 className="text-3xl font-bold mb-6">Instructors</h1>
        )}

        <Card className="mb-8 shadow-md">
          <CardHeader className="pb-2">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <CardTitle>Manage Instructors</CardTitle>
              <Button className="flex items-center gap-2">
                <UserPlus size={16} />
                <span>Add Instructor</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <Input
                  placeholder="Search instructors..."
                  className="pl-10 w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter size={16} />
                  <span>Filter</span>
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <Download size={16} />
                  <span>Export</span>
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Instructor</TableHead>
                    <TableHead>Specialty</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Courses</TableHead>
                    <TableHead>Students</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInstructors.map((instructor) => (
                    <TableRow key={instructor.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage
                              src={instructor.avatar}
                              alt={instructor.name}
                            />
                            <AvatarFallback>
                              {instructor.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{instructor.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {instructor.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{instructor.specialty}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={getStatusColor(instructor.status)}
                          variant="outline"
                        >
                          {instructor.status.charAt(0).toUpperCase() +
                            instructor.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>{instructor.courses}</TableCell>
                      <TableCell>{instructor.students}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span>{instructor.rating}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              Actions
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() =>
                                handleAction(
                                  'View',
                                  instructor.id,
                                  instructor.name
                                )
                              }
                            >
                              <EyeIcon className="mr-2 h-4 w-4" />
                              <span>View</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleAction(
                                  'Edit',
                                  instructor.id,
                                  instructor.name
                                )
                              }
                            >
                              <FileEdit className="mr-2 h-4 w-4" />
                              <span>Edit</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleAction(
                                  'Delete',
                                  instructor.id,
                                  instructor.name
                                )
                              }
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              <span>Delete</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </LayoutComponent>
  );
};

export default InstructorsPage;
