import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import type { Product } from '../types/product';
import ProductCard from '../components/ProductCard';

interface Slide {
  id: number;
  image: string;
}

interface SubCategory {
  id: number;
  name: string;
  image?: string;
}

interface Category {
  id: number;
  name: string;
  image?: string;
  subCategories: SubCategory[];
}

interface Brand {
  id: number;
  name: string;
  logo: string;
}

const DEFAULT_CATEGORY_BANNER_IMAGE = 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=800&q=80';

const normalize = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

export default function ProductsPage() {
  const [searchParams] = useSearchParams();
  const category = searchParams.get('category') || 'Parapharmacie';
  const subCategoryParam = searchParams.get('subCategory');

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [bannerImage, setBannerImage] = useState<string>(DEFAULT_CATEGORY_BANNER_IMAGE);

  const [selectedSexes, setSelectedSexes] = useState<string[]>([]);
  const [selectedAgeGroups, setSelectedAgeGroups] = useState<string[]>([]);
  const [selectedBrandIds, setSelectedBrandIds] = useState<number[]>([]);
  const [selectedSubCategories, setSelectedSubCategories] = useState<string[]>([]);
  const [showMoreSubCategories, setShowMoreSubCategories] = useState(false);
  const [minPrice, setMinPrice] = useState<number | null>(null);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);

  useEffect(() => {
    api
      .get<Category[]>('/categories')
      .then(res => setCategories(res.data))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    api
      .get<Brand[]>('/brands')
      .then(res => setBrands(res.data))
      .catch(() => setBrands([]));
  }, []);

  useEffect(() => {
    const current = categories.find(c => normalize(c.name) === normalize(category));
    setActiveCategory(current || null);
  }, [categories, category]);

  useEffect(() => {
    setLoading(true);
    setBannerImage(activeCategory?.image || DEFAULT_CATEGORY_BANNER_IMAGE);

    const productsRequest = api.get<Product[]>('/products', { params: { category } });
    const bannerRequest = api.get<Slide[]>('/sliders', { params: { category } });

    Promise.allSettled([productsRequest, bannerRequest])
      .then((results) => {
        const productsResult = results[0];
        if (productsResult.status === 'fulfilled') {
          setProducts(productsResult.value.data);
        }

        const bannerResult = results[1];
        if (bannerResult.status === 'fulfilled') {
          const slides = bannerResult.value.data;
          if (slides && slides.length > 0 && slides[0]?.image) {
            setBannerImage(slides[0].image);
          }
        }
      })
      .catch((err) => console.error('Erreur chargement produits:', err))
      .finally(() => setLoading(false));
  }, [category, activeCategory?.image]);

  useEffect(() => {
    if (!subCategoryParam) {
      setSelectedSubCategories([]);
      return;
    }
    setSelectedSubCategories([subCategoryParam]);
  }, [subCategoryParam, category]);

  useEffect(() => {
    if (products.length === 0) {
      setMinPrice(null);
      setMaxPrice(null);
      return;
    }
    const prices = products.map(p => p.price).filter(v => typeof v === 'number' && !Number.isNaN(v));
    if (prices.length === 0) return;
    setMinPrice(Math.min(...prices));
    setMaxPrice(Math.max(...prices));
  }, [products, category]);

  const toggleString = (values: string[], next: string) => {
    const n = normalize(next);
    const exists = values.some(v => normalize(v) === n);
    if (exists) return values.filter(v => normalize(v) !== n);
    return [...values, next];
  };

  const toggleNumber = (values: number[], next: number) => {
    if (values.includes(next)) return values.filter(v => v !== next);
    return [...values, next];
  };

  const filteredProducts = useMemo(() => {
    const min = minPrice ?? Number.NEGATIVE_INFINITY;
    const max = maxPrice ?? Number.POSITIVE_INFINITY;

    return products.filter(p => {
      if (selectedSexes.length > 0) {
        if (!p.sex) return false;
        if (!selectedSexes.some(s => normalize(s) === normalize(p.sex!))) return false;
      }
      if (selectedAgeGroups.length > 0) {
        if (!p.ageGroup) return false;
        if (!selectedAgeGroups.some(a => normalize(a) === normalize(p.ageGroup!))) return false;
      }
      if (selectedBrandIds.length > 0) {
        if (typeof p.brandId !== 'number') return false;
        if (!selectedBrandIds.includes(p.brandId)) return false;
      }
      if (selectedSubCategories.length > 0) {
        if (!p.subCategory) return false;
        if (!selectedSubCategories.some(sc => normalize(sc) === normalize(p.subCategory!))) return false;
      }
      if (p.price < min || p.price > max) return false;
      return true;
    });
  }, [products, selectedSexes, selectedAgeGroups, selectedBrandIds, selectedSubCategories, minPrice, maxPrice]);

  const counts = useMemo(() => {
    const base = products;

    const countWith = (predicate: (p: Product) => boolean, exclude: 'sex' | 'age' | 'brand' | 'subCategory') => {
      const min = minPrice ?? Number.NEGATIVE_INFINITY;
      const max = maxPrice ?? Number.POSITIVE_INFINITY;

      return base.filter(p => {
        if (exclude !== 'sex' && selectedSexes.length > 0) {
          if (!p.sex) return false;
          if (!selectedSexes.some(s => normalize(s) === normalize(p.sex!))) return false;
        }
        if (exclude !== 'age' && selectedAgeGroups.length > 0) {
          if (!p.ageGroup) return false;
          if (!selectedAgeGroups.some(a => normalize(a) === normalize(p.ageGroup!))) return false;
        }
        if (exclude !== 'brand' && selectedBrandIds.length > 0) {
          if (typeof p.brandId !== 'number') return false;
          if (!selectedBrandIds.includes(p.brandId)) return false;
        }
        if (exclude !== 'subCategory' && selectedSubCategories.length > 0) {
          if (!p.subCategory) return false;
          if (!selectedSubCategories.some(sc => normalize(sc) === normalize(p.subCategory!))) return false;
        }
        if (p.price < min || p.price > max) return false;
        return predicate(p);
      }).length;
    };

    const sexOptions = ['Fille', 'Garçon', 'Unisexe'] as const;
    const ageOptions = ['0-6m', '6-12m', '1-3a', '4-6a', '7-12a', 'Adulte'] as const;
    const subOptions = (activeCategory?.subCategories || []).map(s => s.name);

    return {
      sex: sexOptions.map(sex => ({ value: sex, count: countWith(p => normalize(p.sex || '') === normalize(sex), 'sex') })),
      age: ageOptions.map(age => ({ value: age, count: countWith(p => normalize(p.ageGroup || '') === normalize(age), 'age') })),
      brand: brands.map(b => ({ id: b.id, name: b.name, count: countWith(p => p.brandId === b.id, 'brand') })),
      subCategory: subOptions.map(name => ({ name, count: countWith(p => normalize(p.subCategory || '') === normalize(name), 'subCategory') })),
    };
  }, [products, selectedSexes, selectedAgeGroups, selectedBrandIds, selectedSubCategories, minPrice, maxPrice, activeCategory?.subCategories, brands]);

  const ageLabel = (value: string) => {
    switch (value) {
      case '0-6m': return '0-6 mois';
      case '6-12m': return '6-12 mois';
      case '1-3a': return '1-3 ans';
      case '4-6a': return '4-6 ans';
      case '7-12a': return '7-12 ans';
      case 'Adulte': return 'Adulte';
      default: return value;
    }
  };

  return (
    <main className="container pb-12">
      <div className="mt-6 rounded-2xl overflow-hidden bg-[#e8e1d5] flex flex-col md:flex-row items-center">
        <div className="p-8 md:p-12 flex-1">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 capitalize">{category}</h1>
        </div>
        <div className="flex-1 h-full min-h-[150px]">
          <img
            src={bannerImage}
            alt={category}
            className="w-full h-full object-cover mix-blend-multiply opacity-80"
          />
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8 mt-12">
        <aside className="w-full md:w-72 flex-shrink-0">
          <div className="sticky top-24">
            <div className="bg-white border border-gray-100 rounded-2xl p-5 space-y-6">
              <div>
                <div className="text-sm font-extrabold text-gray-900">Sexe</div>
                <div className="mt-3 space-y-2">
                  {counts.sex.map(({ value, count }) => (
                    <label key={value} className="flex items-center justify-between gap-3 text-sm">
                      <span className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={selectedSexes.some(s => normalize(s) === normalize(value))}
                          onChange={() => setSelectedSexes(v => toggleString(v, value))}
                          className="h-4 w-4 rounded text-primary focus:ring-primary"
                        />
                        <span className="text-gray-800">{value}</span>
                      </span>
                      <span className="text-primary font-bold">({count})</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="h-px bg-gray-100" />

              <div>
                <div className="text-sm font-extrabold text-gray-900">Âge</div>
                <div className="mt-3 space-y-2">
                  {counts.age.map(({ value, count }) => (
                    <label key={value} className="flex items-center justify-between gap-3 text-sm">
                      <span className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={selectedAgeGroups.some(a => normalize(a) === normalize(value))}
                          onChange={() => setSelectedAgeGroups(v => toggleString(v, value))}
                          className="h-4 w-4 rounded text-primary focus:ring-primary"
                        />
                        <span className="text-gray-800">{ageLabel(value)}</span>
                      </span>
                      <span className="text-primary font-bold">({count})</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="h-px bg-gray-100" />

              <div>
                <div className="text-sm font-extrabold text-gray-900">Type de produit</div>
                <div className="mt-3 space-y-2">
                  {counts.subCategory.slice(0, showMoreSubCategories ? counts.subCategory.length : 7).map(({ name, count }) => (
                    <label key={name} className="flex items-center justify-between gap-3 text-sm">
                      <span className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={selectedSubCategories.some(sc => normalize(sc) === normalize(name))}
                          onChange={() => setSelectedSubCategories(v => toggleString(v, name))}
                          className="h-4 w-4 rounded text-primary focus:ring-primary"
                        />
                        <span className="text-gray-800">{name}</span>
                      </span>
                      <span className="text-primary font-bold">({count})</span>
                    </label>
                  ))}
                </div>
                {counts.subCategory.length > 7 && (
                  <button
                    onClick={() => setShowMoreSubCategories(v => !v)}
                    className="mt-3 text-sm font-bold text-primary hover:opacity-80"
                  >
                    {showMoreSubCategories ? 'Afficher moins' : 'Afficher plus'}
                  </button>
                )}
              </div>

              <div className="h-px bg-gray-100" />

              <div>
                <div className="text-sm font-extrabold text-gray-900">Marques</div>
                <div className="mt-3 space-y-2">
                  {counts.brand.slice(0, 10).map(({ id, name, count }) => (
                    <label key={id} className="flex items-center justify-between gap-3 text-sm">
                      <span className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={selectedBrandIds.includes(id)}
                          onChange={() => setSelectedBrandIds(v => toggleNumber(v, id))}
                          className="h-4 w-4 rounded text-primary focus:ring-primary"
                        />
                        <span className="text-gray-800">{name}</span>
                      </span>
                      <span className="text-primary font-bold">({count})</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="h-px bg-gray-100" />

              <div>
                <div className="text-sm font-extrabold text-gray-900">Prix</div>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    value={minPrice ?? ''}
                    onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : null)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3 focus:ring-2 focus:ring-primary outline-none"
                    placeholder="Min"
                  />
                  <input
                    type="number"
                    value={maxPrice ?? ''}
                    onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : null)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3 focus:ring-2 focus:ring-primary outline-none"
                    placeholder="Max"
                  />
                </div>
                <button
                  onClick={() => {
                    setSelectedSexes([]);
                    setSelectedAgeGroups([]);
                    setSelectedBrandIds([]);
                    setSelectedSubCategories([]);
                    setShowMoreSubCategories(false);
                    if (products.length > 0) {
                      const prices = products.map(p => p.price);
                      setMinPrice(Math.min(...prices));
                      setMaxPrice(Math.max(...prices));
                    } else {
                      setMinPrice(null);
                      setMaxPrice(null);
                    }
                  }}
                  className="mt-3 w-full text-sm font-extrabold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl py-2.5 transition-colors"
                >
                  Réinitialiser
                </button>
              </div>
            </div>
          </div>
        </aside>

        <div className="flex-grow">
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-b border-gray-100 py-4 mb-8">
            <div className="flex items-center gap-6">
              <button className="flex items-center gap-2 text-sm font-bold text-gray-700 hover:text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filtrer
              </button>

              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-500">Trier par</span>
                <select className="font-bold text-gray-700 border-none bg-transparent focus:ring-0 cursor-pointer">
                  <option>Date, de la plus récente à la plus ancienne</option>
                  <option>Prix croissant</option>
                  <option>Prix décroissant</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">Voir en</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1 rounded ${viewMode === 'list' ? 'text-primary' : 'text-gray-400'}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1 rounded ${viewMode === 'grid' ? 'text-primary' : 'text-gray-400'}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse bg-white rounded-xl aspect-[3/4] border border-gray-100" />
              ))}
            </div>
          ) : (
            <div className={`grid ${viewMode === 'grid' ? 'grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-6`}>
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
