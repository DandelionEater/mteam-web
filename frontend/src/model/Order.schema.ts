class OrderItem {
  manufacturingID!: string;
  quantity!: number;
}

export class Address {
  line1!: string;
  line2?: string;
  city!: string;
  postalCode!: string;
  country!: string;
}

export class Order {
  enteredEmail!: string;
  delivery!: boolean;
  address?: Address;
  items!: OrderItem[];
  total!: number;
}
