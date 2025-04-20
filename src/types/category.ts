export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  parent_id: number | null;
  icon: string;
  order: number;
  status: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  has_children: boolean;
}

export interface CategoriesResponse {
  categories: Category[];
  meta: {
    total: number;
    page: number;
    last_page: number;
    per_page: number;
  };
}
