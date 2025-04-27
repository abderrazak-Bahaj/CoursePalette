import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoryService } from '@/services/api/categoryService';
import {
  AdminLayout,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Input,
  Badge,
} from '@/components';
import {
  Search,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  FolderIcon,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import CategoryModal from '@/components/admin/CategoryModal';
import { DeleteCategoryModal } from '@/components/admin/DeleteCategoryModal';
import { useNavigate } from 'react-router-dom';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  parent_id: string | null;
  icon: string | null;
  order: number;
  status: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  has_children: boolean;
}

interface CategoryFormData {
  name: string;
  description?: string;
  parent_id?: string | number | null;
  icon?: string | null;
  order: number;
  status: 'ACTIVE' | 'INACTIVE' | 'DRAFT';
}

const AdminCategoriesPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isCategoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Fetch categories
  const { data, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.getAllCategories(),
  });

  // Create category mutation
  const createCategoryMutation = useMutation({
    mutationFn: (categoryData: CategoryFormData) => {
      console.log("Create category data:", categoryData);
      return categoryService.createCategory(categoryData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast({
        title: 'Category created',
        description: 'Category has been created successfully',
      });
      setCategoryModalOpen(false);
    },
    onError: (error) => {
      console.error("Create error:", error);
      toast({
        title: 'Error',
        description: 'Failed to create category',
        variant: 'destructive',
      });
    },
  });

  // Update category mutation
  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CategoryFormData }) => {
      console.log("Updating category with ID:", id);
      console.log("Update data:", data);
      return categoryService.updateCategory(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast({
        title: 'Category updated',
        description: 'Category has been updated successfully',
      });
      setCategoryModalOpen(false);
      setEditCategory(null);
    },
    onError: (error) => {
      console.error("Update category error:", error);
      toast({
        title: 'Error',
        description: 'Failed to update category',
        variant: 'destructive',
      });
    },
  });

  // Delete category mutation
  const deleteCategoryMutation = useMutation({
    mutationFn: (id: string) => categoryService.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast({
        title: 'Category deleted',
        description: 'Category has been deleted successfully',
      });
      setDeleteModalOpen(false);
      setSelectedCategory(null);
    },
    onError: (error) => {
      console.error("Delete error:", error);
      toast({
        title: 'Error',
        description: 'Failed to delete category',
        variant: 'destructive',
      });
    },
  });

  const handleSubmitCategory = (formData: CategoryFormData) => {
    console.log("Form data received:", formData);
    
    if (editCategory) {
      console.log("Updating existing category:", editCategory.id);
      updateCategoryMutation.mutate({
        id: editCategory.id,
        data: formData
      });
    } else {
      console.log("Creating new category");
      createCategoryMutation.mutate(formData);
    }
  };

  const handleDeleteCategory = () => {
    if (selectedCategory) {
      deleteCategoryMutation.mutate(selectedCategory.id);
    }
  };

  const openEditModal = (category: Category) => {
    console.log("Opening edit modal for category:", category);
    setEditCategory(category);
    setCategoryModalOpen(true);
  };

  const openDeleteModal = (category: Category) => {
    setSelectedCategory(category);
    setDeleteModalOpen(true);
  };

  const handleCloseModal = () => {
    setCategoryModalOpen(false);
    setEditCategory(null);
  };

  // Filter categories based on search query
  const filteredCategories = data?.categories?.filter(
    (category: Category) =>
      category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.description.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const getVariant = (status: string) => {
    switch (status) {
      case 'info':
        return 'info';
      case 'INACTIVE':
        return 'warning';
      case 'DRAFT':
        return 'destructive';
      default:
        return 'default';
    }
  };

  return (
    <AdminLayout title="Manage Categories">
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent>
            <div className="flex flex-col md:flex-row pt-8 gap-4 mb-6">
              <div className="relative flex-1">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <Input
                  placeholder="Search categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 md:w-[300px]"
                />
              </div>
              <Button onClick={() => setCategoryModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Category
            </Button>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Icon</TableHead>
                    <TableHead>Order</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        Loading categories...
                      </TableCell>
                    </TableRow>
                  ) : filteredCategories.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        No categories found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCategories.map((category: Category) => (
                      <TableRow key={category.id}>
                        <TableCell className="font-medium">{category.name}</TableCell>
                        <TableCell>
                          <div className="max-w-xs truncate">
                            {category.description || 'No description'}
                          </div>
                        </TableCell>
                        <TableCell>
                          {category.icon ? (
                            <div className="flex items-center gap-2">
                              <FolderIcon className="h-4 w-4" />
                              <span>{category.icon}</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">No icon</span>
                          )}
                        </TableCell>
                        <TableCell>{category.order}</TableCell>
                        <TableCell>
                          <Badge
                            variant={getVariant(category.status)}
                          >
                            {category.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => navigate(`/admin/categories/${category.slug}`)}
                              >
                                <FolderIcon className="mr-2 h-4 w-4" />
                                <span>View</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => openEditModal(category)}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                <span>Edit</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => openDeleteModal(category)}
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                <span>Delete</span>
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
          </CardContent>
        </Card>
      </div>

      {/* Create/Edit Category Modal */}
      <CategoryModal
        isOpen={isCategoryModalOpen}
        onOpenChange={handleCloseModal}
        onSubmit={handleSubmitCategory}
        category={editCategory}
        isLoading={
          editCategory
            ? updateCategoryMutation.isPending
            : createCategoryMutation.isPending
        }
      />

      {/* Delete Category Modal */}
      {selectedCategory && (
        <DeleteCategoryModal
          isOpen={deleteModalOpen}
          onOpenChange={setDeleteModalOpen}
          categoryName={selectedCategory.name}
          onConfirmDelete={handleDeleteCategory}
          isLoading={deleteCategoryMutation.isPending}
        />
      )}
    </AdminLayout>
  );
};

export default AdminCategoriesPage; 