class LocalizedString {
  en?: string;
  lt?: string;
}

export class Gallery {
  name!: LocalizedString;
  description: LocalizedString = new LocalizedString();
  images!: string[];
}

export class Item {
  name!: LocalizedString;
  description?: LocalizedString;
  manufacturingID!: string;
  stock!: number;
  price!: number;
  images!: string[];
}
