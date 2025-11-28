import { prop, getModelForClass, modelOptions, index } from '@typegoose/typegoose';

class OrderItem {
  @prop({ required: true })
  manufacturingID!: string;

  @prop({ required: true })
  quantity!: number;
}

class Address {
  @prop({ required: true })
  street!: string;

  @prop({ required: true })
  houseNumber!: string;

  @prop()
  apartment?: string;

  @prop({ required: true })
  city!: string;

  @prop({ required: true })
  postalCode!: string;

  @prop({ required: true })
  country!: string;
}

export enum OrderStatus {
  PendingPayment = 'pending_payment',
  Created = 'created',
  Packing = 'packing',
  Sent = 'sent',
  Completed = 'completed',
  Cancelled = 'cancelled', 
}

function generateOrderNumber(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out = '';
  for (let i = 0; i < 16; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

@modelOptions({ schemaOptions: { timestamps: true } })
@index({ createdAt: -1 })
export class Order {
  @prop({ required: true, unique: true, default: generateOrderNumber })
  orderNumber!: string;

  @prop({ required: true })
  enteredEmail!: string;

  @prop({ required: true })
  delivery!: boolean;

  @prop({ _id: false })
  address?: Address;

  @prop({ type: () => [OrderItem], _id: false })
  items!: OrderItem[];

  @prop({ required: true })
  total!: number;

  @prop({ required: true, enum: OrderStatus, default: OrderStatus.Created })
  status!: OrderStatus;

  @prop({ required: false, enum: ["en", "lt"], default: "en" })
  locale?: "en" | "lt";
}

export const OrderModel = getModelForClass(Order);
