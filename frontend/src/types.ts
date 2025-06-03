export interface BaseDesign {
  id: string;
  nameKey: string;
  descriptionKey: string;
  price: number;
  stock: number;
  images: string[];
  categoryKey: string;
  quantity: number;

  manufacturingID: string;
}
  
export type DisplayDesign = BaseDesign;