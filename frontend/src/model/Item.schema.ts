export interface LocalizedString {
  en: string;
  lt: string;
}

export class Gallery {
  _id!: string;
  name!: LocalizedString;
  description: LocalizedString = { en: "", lt: "" };
  images!: string[];
}

export interface Item {
  _id: string;
  name: LocalizedString;
  description?: LocalizedString;
  manufacturingID: string;
  category: string;
  stock: number;
  price: number;
  images: string[];
}
