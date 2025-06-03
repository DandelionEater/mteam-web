export interface LocalizedString {
  en?: string;
  lt?: string;
}

export interface GalleryItem {
  id: string;
  images: string[];
  name: LocalizedString;
  description: LocalizedString;
}

export const gallery: GalleryItem[] = [];