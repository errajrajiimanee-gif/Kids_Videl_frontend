export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  subCategory?: string;
  brandId?: number;
  sex?: 'Fille' | 'Garçon' | 'Unisexe';
  ageGroup?: '0-6m' | '6-12m' | '1-3a' | '4-6a' | '7-12a' | 'Adulte';
}
