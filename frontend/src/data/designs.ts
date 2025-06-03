import { BaseDesign } from '../types';

export const designs: BaseDesign[] = [
  {
    id: "0",
    nameKey: 'designs.card1_name',
    descriptionKey: 'designs.card1_description',
    price: 200,
    stock: 5,
    images: [
      "https://placehold.co/400x250?text=Chair+1",
      "https://placehold.co/400x250?text=Chair+2"
    ],
    categoryKey: 'categories.chair',
    quantity: 15,
    manufacturingID: "1",
  },
  {
    id: "1",
    nameKey: 'designs.card2_name',
    descriptionKey: 'designs.card2_description',
    price: 250,
    stock: 10,
    images: [
      "https://placehold.co/400x250?text=Table+1",
      "https://placehold.co/400x250?text=Table+2"
    ],
    categoryKey: 'categories.table',
    quantity: 12,
    manufacturingID: "2",
  },
  {
    id: "2",
    nameKey: 'designs.card3_name',
    descriptionKey: 'designs.card3_description',
    price: 350,
    stock: 3,
    images: [
      "https://placehold.co/400x250?text=Bench+1",
      "https://placehold.co/400x250?text=Bench+2"
    ],
    categoryKey: 'categories.bench',
    quantity: 8,
    manufacturingID: "3",
  },
];
