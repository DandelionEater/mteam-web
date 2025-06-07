import { LocalizedString } from "../data/gallery";

export interface CategoryItem {
  id?: string;
  name: LocalizedString;
}

export interface Category extends CategoryItem {
  _id: string;
}

export const categories: CategoryItem[] = [];