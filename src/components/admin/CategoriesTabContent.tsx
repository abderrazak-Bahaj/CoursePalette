
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import CategoryForm from "./CategoryForm";

interface CategoriesTabContentProps {
  className?: string;
}

const CategoriesTabContent = ({ className }: CategoriesTabContentProps) => {
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  return (
    <div className={className}>
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Manage Categories</h3>
        <Button onClick={() => setIsAddingCategory(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </div>
      
      {isAddingCategory ? (
        <CategoryForm onCancel={() => setIsAddingCategory(false)} />
      ) : (
        <p className="text-sm text-gray-500">
          Use this panel to add, edit, or remove course categories.
        </p>
      )}
    </div>
  );
};

export default CategoriesTabContent;
