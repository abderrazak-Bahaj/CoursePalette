import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { categoryService } from '@/services/api/categoryService';
import {
  AdminLayout,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components';
import { ArrowLeft, FolderIcon, Code, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import WrapperLoading from '@/components/ui/wrapper-loading';

interface Course {
  id: string;
  title: string;
  description: string;
  price: string;
  image_url: string;
  duration: number;
  duration_readable: string;
  level: string;
  status: string;
  language: string;
  skills: string;
  is_enrolled: boolean;
  is_completed: boolean;
}

const AdminCategoriesViewPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  // Fetch category details
  const { data, isLoading, error } = useQuery({
    queryKey: ['category', slug],
    queryFn: () => categoryService.getCategory(slug || ''),
    enabled: !!slug,
  });

  const category = data?.data;
  const courses: Course[] = category?.courses || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'INACTIVE':
        return 'bg-gray-100 text-gray-800';
      case 'DRAFT':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'BEGINNER':
        return 'bg-blue-100 text-blue-800';
      case 'INTERMEDIATE':
        return 'bg-yellow-100 text-yellow-800';
      case 'ADVANCED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const goBack = () => {
    navigate('/admin/categories');
  };

  const navigateToCourse = (courseId: string) => {
    // Navigate to course detail page
    window.open(`/courses/${courseId}`, '_blank');
  };

  const renderIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'code':
        return <Code className="h-5 w-5" />;
      default:
        return <FolderIcon className="h-5 w-5" />;
    }
  };

  const parseSkills = (skillsStr: string): string[] => {
    try {
      return JSON.parse(skillsStr);
    } catch (e) {
      return [];
    }
  };

  return (
    <AdminLayout title={category?.name || 'Category Details'}>
      <div className="container mx-auto px-4 py-8">
        <Button variant="outline" onClick={goBack} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Categories
        </Button>

        <WrapperLoading isLoading={isLoading}>
          {error ? (
            <Card>
              <CardContent className="py-8">
                <div className="text-center">
                  <p className="text-red-500">
                    Failed to load category details
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => navigate('/admin/categories')}
                    className="mt-4"
                  >
                    Return to Categories
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : category ? (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    {category.icon ? renderIconComponent(category.icon) : <FolderIcon className="mr-2 h-6 w-6" />}
                    <span className="ml-2">{category.name}</span>
                    {category.status && (
                      <Badge
                        className={`${getStatusColor(category.status)} ml-4`}
                      >
                        {category.status}
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">
                          Description
                        </h3>
                        <p className="mt-1">
                          {category.description || 'No description provided'}
                        </p>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-gray-500">
                          Slug
                        </h3>
                        <p className="mt-1">{category.slug}</p>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-gray-500">
                          Icon
                        </h3>
                        <div className="mt-1 flex items-center gap-2">
                          {category.icon ? (
                            <>
                              {renderIconComponent(category.icon)}
                              <span>{category.icon}</span>
                            </>
                          ) : (
                            'No icon set'
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">
                          Parent Category
                        </h3>
                        <p className="mt-1">
                          {category.parent
                            ? category.parent.name
                            : 'No parent category'}
                        </p>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-gray-500">
                          Order
                        </h3>
                        <p className="mt-1">{category.order}</p>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-gray-500">
                          Has Subcategories
                        </h3>
                        <p className="mt-1">
                          {category.has_children ? 'Yes' : 'No'}
                        </p>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-gray-500">
                          Created At
                        </h3>
                        <p className="mt-1">
                          {new Date(category.created_at).toLocaleString()}
                        </p>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-gray-500">
                          Updated At
                        </h3>
                        <p className="mt-1">
                          {new Date(category.updated_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Courses in this category */}
              {courses.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Courses in this Category</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Title</TableHead>
                          <TableHead>Level</TableHead>
                          <TableHead>Duration</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {courses.map((course) => (
                          <TableRow key={course.id}>
                            <TableCell className="font-medium">
                              {course.title}
                            </TableCell>
                            <TableCell>
                              <Badge className={getLevelColor(course.level)}>
                                {course.level}
                              </Badge>
                            </TableCell>
                            <TableCell>{course.duration_readable}</TableCell>
                            <TableCell>${course.price}</TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(course.status)}>
                                {course.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigateToCourse(course.id)}
                              >
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}

              {/* Child categories section - if needed */}
              {category.children && category.children.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Child Categories</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {category.children.map((child: any) => (
                        <Card key={child.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/admin/categories/${child.slug}`)}>
                          <CardContent className="p-4 flex items-center">
                            {child.icon ? renderIconComponent(child.icon) : <FolderIcon className="h-5 w-5" />}
                            <span className="ml-2 font-medium">{child.name}</span>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <Card>
              <CardContent className="py-8">
                <div className="text-center">
                  <p>Category not found</p>
                  <Button
                    variant="outline"
                    onClick={() => navigate('/admin/categories')}
                    className="mt-4"
                  >
                    Return to Categories
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </WrapperLoading>
      </div>
    </AdminLayout>
  );
};

export default AdminCategoriesViewPage;
