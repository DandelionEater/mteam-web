import { prop, getModelForClass } from '@typegoose/typegoose';

class LocalizedString {
  @prop()
  en?: string;

  @prop()
  lt?: string;
}

class GalleryEntry {
  @prop({ _id: false })
  name?: LocalizedString;

  @prop({ _id: false })
  description?: LocalizedString;

  @prop({ type: () => [String] })
  images?: string[];
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

  @prop({ _id: false })
  galleryEntry?: GalleryEntry;
}

export const ItemModel = getModelForClass(Item);
