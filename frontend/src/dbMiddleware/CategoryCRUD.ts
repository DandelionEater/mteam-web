import { CategoryItem } from "../model/Category.schema";

const BASE_URL = "http://localhost:4000/api/categories";

export const handleCategoryAdd = async (form: CategoryItem): Promise<CategoryItem> => {
  try {
    const response = await fetch(BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to add category");
    }

    return data.entry;
  } catch (error) {
    console.error("Error submitting category:", error);
    throw error;
  }
};

export const fetchCategories = async (): Promise<CategoryItem[]> => {
  try {
    const response = await fetch(BASE_URL);
    if (!response.ok) throw new Error("Failed to fetch categories");

    const data = await response.json();

    return data.map((cat: any) => ({
      ...cat,
      id: cat._id,
    }));
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
};

export const updateCategory = async (id: string, form: CategoryItem): Promise<CategoryItem> => {
  try {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to update category");
    }

    return data;
  } catch (error) {
    console.error("Error updating category:", error);
    throw error;
  }
};

export const deleteCategory = async (id: string): Promise<void> => {
  try {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: "DELETE",
      credentials: 'include',
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || "Failed to delete category");
    }
  } catch (error) {
    console.error("Error deleting category:", error);
    throw error;
  }
};
