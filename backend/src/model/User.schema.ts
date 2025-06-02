import { prop, getModelForClass } from '@typegoose/typegoose';

export class User {
  @prop({ required: true, unique: true })
  email: string;

  @prop({ required: true })
  passwordHash: string;
}

export const UserModel = getModelForClass(User);
