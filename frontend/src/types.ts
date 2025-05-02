export type BaseDesign = {
    id: number;
    name: string;
    description: string;
    price: number;
    stock: number;
    image: string;
    category: string;
  };
  
  export type DisplayDesign = BaseDesign;

  export type CartItem = BaseDesign & {
    quantity: number;
  };
  