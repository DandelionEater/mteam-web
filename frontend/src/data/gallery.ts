export interface GalleryItem {
  id: number;
  images: string[];
  nameKey: string;
  descriptionKey: string;
}

export const gallery: GalleryItem[] = [
  {
    id: 1,
    nameKey: "gallery.item1.name",
    descriptionKey: "gallery.item1.description",
    images: [
      "https://placehold.co/400x300?text=Living+1",
      "https://placehold.co/400x300?text=Living+2",
      "https://placehold.co/400x300?text=Living+3",
    ],
  },
  {
    id: 2,
    nameKey: "gallery.item2.name",
    descriptionKey: "gallery.item2.description",
    images: [
      "https://placehold.co/400x300?text=Bedroom+1",
      "https://placehold.co/400x300?text=Bedroom+2",
    ],
  },
];
