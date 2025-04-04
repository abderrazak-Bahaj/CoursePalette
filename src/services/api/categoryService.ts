
import { get, post, put, del } from "./apiClient";

interface CategoryData {
  name: string;
  description?: string;
  parent_id?: number | null;
  icon?: string | null;
  order?: number;
  status?: string;
}

export const categoryService = {
  getAllCategories: (query?: string) => {
    return get(`/categories${query ? '?'+query : ''}`);
  },
  getCategory: (id: string) => {
    return get(`/categories/${id}`);
  },

  createCategory: (data: CategoryData) => {
    return post("/categories", data);
  },

  updateCategory: (id: string, data: CategoryData) => {
    return put(`/categories/${id}`, data);
  },
  deleteCategory: (id: string) => {
    return del(`/categories/${id}`);
  }
};
