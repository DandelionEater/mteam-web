import { Ref, prop, getModelForClass } from '@typegoose/typegoose';
import { Category } from './Category.schema';

class LocalizedString {
  @prop()
  en?: string;

  @prop()
  lt?: string;
}

export class Gallery {
  @prop({ required: true,  _id: false })
  name!: LocalizedString;

  @prop({ _id: false })
  description: LocalizedString;

  @prop({ required: true, type: () => [String] })
  images!: string[];
}

export class Item {
  @prop({ required: true, _id: false })
  name!: LocalizedString;

  @prop({ _id: false })
  description?: LocalizedString;

  @prop({ required: true })
  manufacturingID!: string;

  @prop({ required: true })
  stock!: number;

  @prop({ required: true })
  price!: number;

  @prop({ type: () => [String] })
  images!: string[];

  @prop({ ref: () => Category, required: true })
  category!: Ref<Category>;
}

export const ItemModel = getModelForClass(Item);
export const GalleryModel = getModelForClass(Gallery);
