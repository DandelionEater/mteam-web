export interface BaseDesign {
  id: number;
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