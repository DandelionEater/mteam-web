import { prop, getModelForClass, modelOptions } from '@typegoose/typegoose';

class LocalizedString {
  @prop()
  en?: string;

  @prop()
  lt?: string;
}

@modelOptions({ schemaOptions: { collection: 'categories' } })
export class Category {
  @prop({ required: true, type: () => LocalizedString })
  name!: LocalizedString;
}

export const CategoryModel = getModelForClass(Category);
