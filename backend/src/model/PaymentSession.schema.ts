import { prop, getModelForClass, modelOptions } from '@typegoose/typegoose';

export enum PaymentStatus {
  Pending = 'pending',
  Succeeded = 'succeeded',
  Cancelled = 'cancelled',
  Failed = 'failed',
}

@modelOptions({ schemaOptions: { timestamps: true } })
export class PaymentSession {
  @prop({ required: true, unique: true })
  sessionId!: string;

  @prop({ required: true })
  orderId!: string;

  @prop({ required: true })
  amountCents!: number;

  @prop({ required: true })
  currency!: string;

  @prop({ required: true, enum: PaymentStatus, default: PaymentStatus.Pending })
  status!: PaymentStatus;

  @prop()
  successUrl?: string;

  @prop()
  cancelUrl?: string;

  @prop()
  expiresAt?: Date;
}

export const PaymentSessionModel = getModelForClass(PaymentSession);
