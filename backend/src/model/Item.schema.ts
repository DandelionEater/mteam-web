import { prop, getModelForClass } from '@typegoose/typegoose';

class GalleryEntry {
  @prop()
  name?: string;

  @prop()
  description?: string;

  @prop({ type: () => [String] })
  images?: string[];
}

export class Item {
  @prop({ required: true })
  name!: string;

  @prop()
  description?: string;

  @prop({ required: true })
  manufacturingID!: string;

  @prop({ required: true })
  stock!: number;

  @prop({ required: true })
  price!: number;

  @prop({ type: () => [String] })
  images!: string[];

  @prop({ _id: false }) // embedded subdocument
  galleryEntry?: GalleryEntry;
}

export const ItemModel = getModelForClass(Item);
