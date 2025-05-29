import { prop, getModelForClass } from '@typegoose/typegoose';

class OrderItem {
  @prop({ required: true })
  manufacturingID!: string;

  @prop({ required: true })
  quantity!: number;
}

export class Order {
  @prop({ required: true })
  enteredEmail!: string;

  @prop({ required: true })
  delivery!: boolean;

  @prop()
  address?: string;

  @prop({ type: () => [OrderItem], _id: false })
  items!: OrderItem[];

  @prop({ required: true })
  total!: number;
}

export const OrderModel = getModelForClass(Order);
