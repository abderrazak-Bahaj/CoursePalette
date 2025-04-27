import { get, post, put, del } from './apiClient';

interface CategoryData {
  name: string;
  description?: string;
  parent_id?: string | number | null;
  icon?: string | null;
  order?: number;
  status?: string;
}

export const categoryService = {
  getAllCategories: (params?: Record<string, string>) => {
    return get(`/categories`, { params });
  },
  getCategory: (id: string) => {
    return get(`/categories/${id}`);
  },

  createCategory: (data: CategoryData) => {
    console.log("Creating category with data:", data);
    
    // Ensure proper data formatting
    const formattedData = {
      ...data,
      order: Number(data.order),
      parent_id: data.parent_id ? data.parent_id : null
    };
    
    return post('/categories', formattedData);
  },

  updateCategory: (id: string, data: CategoryData) => {
    console.log("Updating category with ID:", id);
    console.log("Update data:", data);
    
    // Ensure all required fields are sent with proper types
    const formattedData = {
      ...data,
      order: Number(data.order),
      parent_id: data.parent_id ? data.parent_id : null
    };
    
    return put(`/categories/${id}`, formattedData)
      .catch(error => {
        console.error("Update API error:", error);
        throw error;
      });
  },
  
  deleteCategory: (id: string) => {
    return del(`/categories/${id}`);
  },
};
