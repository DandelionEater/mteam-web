import { Category } from "../model/Category.schema";

export async function fetchCategories(): Promise<Category[]> {
  const response = await fetch("http://localhost:4000/api/categories");
  if (!response.ok) {
    throw new Error("Failed to fetch categories");
  }
  return await response.json();
}