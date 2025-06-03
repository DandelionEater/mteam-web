class OrderItem {
  manufacturingID!: string;
  quantity!: number;
}

export class Order {
  enteredEmail!: string;
  delivery!: boolean;
  address?: string;
  items!: OrderItem[];
  total!: number;
}
