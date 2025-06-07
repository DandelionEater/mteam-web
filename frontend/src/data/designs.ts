import { LocalizedString } from "./gallery";

export interface DesignItem {
  id: string;
  name: LocalizedString;
  description: LocalizedString;
  manufacturingID: string;
  category: { name: LocalizedString; _id?: string; } | string;
  price: number;
  stock: number;
  images: string[];
}
  
export const designs: DesignItem[] = [];

