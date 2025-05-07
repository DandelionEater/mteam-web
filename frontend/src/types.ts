export interface BaseDesign {
  id: number;
  nameKey: string;
  descriptionKey: string;
  price: number;
  stock: number;
  image: string;
  categoryKey: string;
  quantity: number;
}
  
export type DisplayDesign = BaseDesign;