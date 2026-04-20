import { useState, useEffect, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { Plus, Pencil, Trash2, X, Check, Package, Image as ImageIcon, Upload, AlertCircle, ChevronDown, GripVertical, GalleryHorizontal, MessageCircle, Phone, Mail, ExternalLink } from 'lucide-react';
import { adminApi } from '../services/adminApi';

// Interfaces
interface SubCategory { id: number; name: string; image?: string; }
interface Category { id: number; name: string; image?: string; subCategories: SubCategory[]; }
interface Product { id: number; name: string; description: string; price: number; category: string; subCategory?: string; brandId?: number; sex?: 'Fille' | 'Garçon' | 'Unisexe'; ageGroup?: '0-6m' | '6-12m' | '1-3a' | '4-6a' | '7-12a' | 'Adulte'; image: string; }
interface Slide { id: number; title: string; subtitle: string; image: string; buttonText: string; link: string; category?: string; }
interface Brand { id: number; name: string; logo: string; }
interface OrderItem { productId: number; name: string; price: number; quantity: number; }
interface OrderCustomer { email?: string; firstName?: string; lastName?: string; address?: string; apartment?: string; postalCode?: string; city?: string; phone?: string; }
interface Order { id: number; createdAt: string; status: 'pending' | 'confirmed' | 'cancelled'; paymentMethod: 'cod'; shippingMethod: 'casablanca' | 'hors-casablanca'; shippingCost: number; currency: 'MAD'; subtotal: number; total: number; customer: OrderCustomer; items: OrderItem[]; }
interface LoyaltyMember { id: number; firstName: string; lastName: string; email: string; phone: string; points: number; createdAt: string; }

// Components
function ImageUpload({ image, onImageChange }: { image: string, onImageChange: (file: string) => void }) {
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    const readAsDataUrl = (blob: Blob) =>
      new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(String(reader.result || ''));
        reader.onerror = () => reject(new Error('Lecture de fichier impossible'));
        reader.readAsDataURL(blob);
      });

    const estimateBytesFromDataUrl = (dataUrl: string) => {
      const idx = dataUrl.indexOf(',');
      const base64 = idx >= 0 ? dataUrl.slice(idx + 1) : dataUrl;
      const padding = base64.endsWith('==') ? 2 : base64.endsWith('=') ? 1 : 0;
      return Math.floor((base64.length * 3) / 4) - padding;
    };

    const maxDataUrlLength = 190_000;
    const maxBytes = 130_000;
    const maxWidth = 1400;

    const compress = async () => {
      setError(null);
      const inputUrl = await readAsDataUrl(file);
      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Image invalide'));
        img.src = inputUrl;
      });

      const drawToCanvas = (w: number, h: number) => {
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Canvas non supporté');

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);
        return canvas;
      };

      let currentMaxW = maxWidth;
      let best: string | null = null;

      for (let attempt = 0; attempt < 8; attempt++) {
        const scale = Math.min(1, currentMaxW / img.width);
        const targetW = Math.max(1, Math.round(img.width * scale));
        const targetH = Math.max(1, Math.round(img.height * scale));
        const canvas = drawToCanvas(targetW, targetH);

        let q = 0.82;
        for (let i = 0; i < 6; i++) {
          const out = canvas.toDataURL('image/jpeg', q);
          best = out;
          if (out.length <= maxDataUrlLength && estimateBytesFromDataUrl(out) <= maxBytes) {
            onImageChange(out);
            return;
          }
          q = Math.max(0.45, q - 0.07);
        }

        currentMaxW = Math.max(320, Math.round(currentMaxW * 0.85));
      }

      if (best) onImageChange(best);
      setError('Image trop lourde. Utilisez une image plus petite ou une URL.');
    };

    compress().catch((e) => setError(e instanceof Error ? e.message : 'Erreur image'));
  }, [onImageChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: false
  });

  return (
    <div className="space-y-2">
      <div 
        {...getRootProps()} 
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary hover:bg-gray-50'
        }`}
      >
        <input {...getInputProps()} />
        {image ? (
          <div className="relative group">
            <img src={image} alt="Preview" className="mx-auto h-48 object-contain rounded-lg" />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
              <p className="text-white font-bold">Changer l'image</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
              <Upload className="w-8 h-8 text-gray-400" />
            </div>
            <div>
              <p className="font-medium text-gray-700">Glissez une image ici ou cliquez pour sélectionner</p>
              <p className="text-sm text-gray-500 mt-1">PNG, JPG jusqu'à 5MB</p>
            </div>
          </div>
        )}
      </div>
      {error ? <div className="text-xs text-red-600 font-bold">{error}</div> : null}
    </div>
  );
}

function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '', price: 0, category: '', subCategory: '', brandId: undefined as number | undefined, sex: 'Unisexe' as Product['sex'], ageGroup: '1-3a' as Product['ageGroup'], image: '' });

  const fetchProducts = async () => {
    try {
      const res = await adminApi.get('/products');
      setProducts(res.data);
    } catch (err) { console.error('Failed to fetch products', err); }
  };

  const fetchCategories = async () => {
    try {
      const res = await adminApi.get('/categories');
      setCategories(res.data);
      setFormData(prev => {
        if (prev.category) return prev;
        const defaultCategory = res.data[0]?.name || '';
        const defaultSubCategory = res.data[0]?.subCategories?.[0]?.name || '';
        return { ...prev, category: defaultCategory, subCategory: defaultSubCategory };
      });
    } catch (err) { console.error('Failed to fetch categories', err); }
  };

  const fetchBrands = async () => {
    try {
      const res = await adminApi.get('/brands');
      setBrands(res.data);
    } catch (err) { console.error('Failed to fetch brands', err); }
  };

  useEffect(() => { fetchProducts(); fetchCategories(); fetchBrands(); }, []);

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({ name: product.name, description: product.description, price: product.price, category: product.category, subCategory: product.subCategory || '', brandId: product.brandId, sex: product.sex || 'Unisexe', ageGroup: product.ageGroup || '1-3a', image: product.image });
    } else {
      setEditingProduct(null);
      const defaultCategory = categories[0]?.name || '';
      const defaultSubCategory = categories[0]?.subCategories?.[0]?.name || '';
      const defaultBrandId = brands[0]?.id;
      setFormData({ name: '', description: '', price: 0, category: defaultCategory, subCategory: defaultSubCategory, brandId: defaultBrandId, sex: 'Unisexe', ageGroup: '1-3a', image: '' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => { setIsModalOpen(false); setEditingProduct(null); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProduct) { await adminApi.put(`/products/${editingProduct.id}`, formData); }
      else { await adminApi.post('/products', formData); }
      fetchProducts();
      handleCloseModal();
    } catch (err) { console.error('Failed to save product', err); }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Voulez-vous vraiment supprimer ce produit ?')) {
      try { await adminApi.delete(`/products/${id}`); fetchProducts(); }
      catch (err) { console.error('Failed to delete product', err); }
    }
  };

  const handleFileChange = (file: string) => {
    setFormData({ ...formData, image: file });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Gestion des Produits</h2>
        <button onClick={() => handleOpenModal()} className="flex items-center justify-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/20"><Plus className="w-5 h-5" />Ajouter un produit</button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Produit</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Catégorie</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Prix</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.map(product => (
              <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-12 w-12 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden border border-gray-200">
                      <img className="h-full w-full object-contain mix-blend-multiply" src={product.image} alt="" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-bold text-gray-900">{product.name}</div>
                      <div className="text-sm text-gray-500 max-w-xs truncate">{product.description}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full bg-primary/10 text-primary uppercase tracking-wide">
                    {product.category}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{product.price} MAD</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => handleOpenModal(product)} className="text-gray-400 hover:text-primary transition-colors mr-4"><Pencil className="w-5 h-5" /></button>
                  <button onClick={() => handleDelete(product.id)} className="text-gray-400 hover:text-red-500 transition-colors"><Trash2 className="w-5 h-5" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-800">{editingProduct ? 'Modifier le produit' : 'Ajouter un nouveau produit'}</h3>
              <button onClick={handleCloseModal} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"><X className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <input type="text" placeholder="Nom du produit" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary outline-none transition-all" />
                  <textarea placeholder="Description" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary outline-none h-32 resize-none transition-all" />
                  <div className="grid grid-cols-2 gap-4">
                    <input type="number" placeholder="Prix" value={formData.price} onChange={e => setFormData({ ...formData, price: Number(e.target.value) })} className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary outline-none transition-all" />
                    <div className="relative">
                      <select
                        value={formData.category}
                        onChange={e => {
                          const nextCategory = e.target.value;
                          const cat = categories.find(c => c.name === nextCategory);
                          setFormData({ ...formData, category: nextCategory, subCategory: cat?.subCategories?.[0]?.name || '' });
                        }}
                        className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary outline-none appearance-none transition-all cursor-pointer"
                      >
                        {categories.map(cat => (<option key={cat.id} value={cat.name}>{cat.name}</option>))}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                      <select
                        value={formData.subCategory}
                        onChange={e => setFormData({ ...formData, subCategory: e.target.value })}
                        className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary outline-none appearance-none transition-all cursor-pointer"
                      >
                        {(categories.find(c => c.name === formData.category)?.subCategories || []).map(sub => (
                          <option key={sub.id} value={sub.name}>{sub.name}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    </div>
                    <div className="relative">
                      <select
                        value={formData.brandId ?? ''}
                        onChange={e => setFormData({ ...formData, brandId: e.target.value ? Number(e.target.value) : undefined })}
                        className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary outline-none appearance-none transition-all cursor-pointer"
                      >
                        <option value="">Sans marque</option>
                        {brands.map(b => (<option key={b.id} value={b.id}>{b.name}</option>))}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                      <select value={formData.sex} onChange={e => setFormData({ ...formData, sex: e.target.value as Product['sex'] })} className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary outline-none appearance-none transition-all cursor-pointer">
                        <option value="Fille">Fille</option>
                        <option value="Garçon">Garçon</option>
                        <option value="Unisexe">Unisexe</option>
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    </div>
                    <div className="relative">
                      <select value={formData.ageGroup} onChange={e => setFormData({ ...formData, ageGroup: e.target.value as Product['ageGroup'] })} className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary outline-none appearance-none transition-all cursor-pointer">
                        <option value="0-6m">0-6 mois</option>
                        <option value="6-12m">6-12 mois</option>
                        <option value="1-3a">1-3 ans</option>
                        <option value="4-6a">4-6 ans</option>
                        <option value="7-12a">7-12 ans</option>
                        <option value="Adulte">Adulte</option>
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Image du produit</label>
                  <ImageUpload image={formData.image} onImageChange={handleFileChange} />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-gray-100">
                <button type="button" onClick={handleCloseModal} className="px-6 py-2.5 font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg mr-4 transition-colors">Annuler</button>
                <button type="submit" className="px-8 py-2.5 bg-primary text-white font-bold rounded-lg hover:opacity-90 transition-all shadow-lg shadow-primary/20 flex items-center gap-2"><Check className="w-5 h-5" /> Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newSubCategoryByCategory, setNewSubCategoryByCategory] = useState<Record<number, string>>({});
  const [newSubCategoryImageByCategory, setNewSubCategoryImageByCategory] = useState<Record<number, string>>({});
  const [isCategoryImageModalOpen, setIsCategoryImageModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryImage, setCategoryImage] = useState('');
  const [categoryImageError, setCategoryImageError] = useState<string | null>(null);
  const [savingCategoryImage, setSavingCategoryImage] = useState(false);
  const [isSubCategoryModalOpen, setIsSubCategoryModalOpen] = useState(false);
  const [editingSubCategory, setEditingSubCategory] = useState<{ categoryId: number; subCategory: SubCategory } | null>(null);
  const [subCategoryForm, setSubCategoryForm] = useState({ name: '', image: '' });

  const fetchCategories = async () => {
    try { const res = await adminApi.get('/categories'); setCategories(res.data); }
    catch (err) { console.error('Failed to fetch categories', err); }
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    try { await adminApi.post('/categories', { name: newCategoryName, image: '', subCategories: [] }); setNewCategoryName(''); fetchCategories(); }
    catch (err) { console.error('Failed to add category', err); }
  };

  const handleAddSubCategory = async (categoryId: number) => {
    const newName = (newSubCategoryByCategory[categoryId] || '').trim();
    const newImage = (newSubCategoryImageByCategory[categoryId] || '').trim();
    if (!newName) return;
    const category = categories.find(c => c.id === categoryId);
    if (!category) return;
    const updatedSubCategories = [...category.subCategories, { id: Date.now(), name: newName, image: newImage || undefined }];
    try {
      await adminApi.put(`/categories/${categoryId}`, { subCategories: updatedSubCategories });
      setNewSubCategoryByCategory(prev => ({ ...prev, [categoryId]: '' }));
      setNewSubCategoryImageByCategory(prev => ({ ...prev, [categoryId]: '' }));
      fetchCategories();
    }
    catch (err) { console.error('Failed to add subcategory', err); }
  };

  const handleDeleteCategory = async (id: number) => {
    if (window.confirm('Voulez-vous vraiment supprimer cette catégorie et toutes ses sous-catégories ?')) {
      try { await adminApi.delete(`/categories/${id}`); fetchCategories(); }
      catch (err) { console.error('Failed to delete category', err); }
    }
  };

  const handleDeleteSubCategory = async (categoryId: number, subCategoryId: number) => {
    const category = categories.find(c => c.id === categoryId);
    if (!category) return;
    const updatedSubCategories = category.subCategories.filter(s => s.id !== subCategoryId);
    try { await adminApi.put(`/categories/${categoryId}`, { subCategories: updatedSubCategories }); fetchCategories(); }
    catch (err) { console.error('Failed to delete subcategory', err); }
  };

  const openCategoryImageModal = (category: Category) => {
    setEditingCategory(category);
    setCategoryImage(category.image || '');
    setCategoryImageError(null);
    setIsCategoryImageModalOpen(true);
  };

  const saveCategoryImage = async () => {
    if (!editingCategory) return;
    try {
      setSavingCategoryImage(true);
      setCategoryImageError(null);
      if (categoryImage.trim().startsWith('data:image') && categoryImage.length > 190_000) {
        setCategoryImageError('Image trop lourde. Choisissez une image plus petite ou une URL.');
        return;
      }
      await adminApi.put(`/categories/${editingCategory.id}`, { image: categoryImage });
      setIsCategoryImageModalOpen(false);
      setEditingCategory(null);
      fetchCategories();
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Échec mise à jour image';
      setCategoryImageError(Array.isArray(message) ? message.join(', ') : String(message));
    } finally {
      setSavingCategoryImage(false);
    }
  };

  const openSubCategoryModal = (categoryId: number, subCategory: SubCategory) => {
    setEditingSubCategory({ categoryId, subCategory });
    setSubCategoryForm({ name: subCategory.name || '', image: subCategory.image || '' });
    setIsSubCategoryModalOpen(true);
  };

  const saveSubCategory = async () => {
    if (!editingSubCategory) return;
    const { categoryId, subCategory } = editingSubCategory;
    const category = categories.find(c => c.id === categoryId);
    if (!category) return;

    const updatedSubCategories = category.subCategories.map(s => {
      if (s.id !== subCategory.id) return s;
      return { ...s, name: subCategoryForm.name, image: subCategoryForm.image || undefined };
    });

    try {
      await adminApi.put(`/categories/${categoryId}`, { subCategories: updatedSubCategories });
      setIsSubCategoryModalOpen(false);
      setEditingSubCategory(null);
      fetchCategories();
    } catch (err) { console.error('Failed to update subcategory', err); }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between"><h2 className="text-2xl font-bold text-gray-800">Gestion des Catégories</h2></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map(category => (
          <div key={category.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
            <div className="flex items-center justify-between"><h3 className="font-bold text-lg text-gray-800">{category.name}</h3><button onClick={() => handleDeleteCategory(category.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button></div>
            <div className="space-y-3">
              <div className="aspect-[3/1] rounded-xl overflow-hidden bg-gray-100">
                {category.image ? (
                  <img src={category.image} alt={category.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-400">Aucune image</div>
                )}
              </div>
              <button onClick={() => openCategoryImageModal(category)} className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2 rounded-lg transition-colors">
                <ImageIcon className="w-4 h-4" />
                Changer l'image
              </button>
            </div>
            <ul className="space-y-2">
              {category.subCategories.map(sub => (
                <li key={sub.id} className="flex items-center justify-between bg-gray-50 p-2 rounded-lg gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                      {sub.image ? (
                        <img src={sub.image} alt={sub.name} className="w-full h-full object-cover" />
                      ) : null}
                    </div>
                    <span className="text-sm text-gray-700 truncate">{sub.name}</span>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button onClick={() => openSubCategoryModal(category.id, sub)} className="p-1 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-md">
                      <Pencil className="w-3 h-3" />
                    </button>
                    <button onClick={() => handleDeleteSubCategory(category.id, sub.id)} className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <form onSubmit={(e) => { e.preventDefault(); handleAddSubCategory(category.id); }} className="flex flex-col gap-2">
              <input
                type="text"
                value={newSubCategoryByCategory[category.id] || ''}
                onChange={e => setNewSubCategoryByCategory(prev => ({ ...prev, [category.id]: e.target.value }))}
                placeholder="Nouvelle sous-catégorie"
                className="w-full bg-gray-100 border-none rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-primary outline-none"
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSubCategoryImageByCategory[category.id] || ''}
                  onChange={e => setNewSubCategoryImageByCategory(prev => ({ ...prev, [category.id]: e.target.value }))}
                  placeholder="Image URL (optionnel)"
                  className="flex-grow bg-gray-100 border-none rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-primary outline-none"
                />
                <button type="submit" className="bg-primary text-white px-3 rounded-lg hover:opacity-90 font-bold flex items-center justify-center shadow-sm transition-all active:scale-95">
                  <Check className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        ))}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"><h3 className="font-bold text-lg text-gray-800 mb-4">Ajouter une catégorie</h3><form onSubmit={handleAddCategory} className="flex gap-2"><input type="text" value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} placeholder="Nom de la catégorie" className="flex-grow bg-gray-100 border-none rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-primary outline-none" /><button type="submit" className="bg-primary text-white p-2 rounded-lg hover:opacity-90"><Plus className="w-5 h-5" /></button></form></div>
      </div>

      {isCategoryImageModalOpen && editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-800">Image: {editingCategory.name}</h3>
              <button onClick={() => { setIsCategoryImageModalOpen(false); setEditingCategory(null); }} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"><X className="w-6 h-6" /></button>
            </div>
            <div className="p-6 space-y-6">
              <ImageUpload image={categoryImage} onImageChange={setCategoryImage} />
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Parapharmacie', src: '/parapharmacie.png' },
                  { label: 'Pour elle', src: '/pourelle.png' },
                  { label: 'Vêtements', src: '/vetement.png' },
                  { label: 'Jouets', src: '/jouets.png' },
                  { label: 'Livres', src: '/livres.png' },
                  { label: 'Hygiène', src: '/hygiene.png' },
                  { label: 'Repas', src: '/repas.png' },
                  { label: 'Sorties', src: '/sortie.png' },
                  { label: 'École', src: '/ecole.png' },
                ].map((p) => (
                  <button
                    key={p.src}
                    type="button"
                    onClick={() => setCategoryImage(p.src)}
                    className={`border rounded-xl overflow-hidden text-left hover:border-primary transition-colors ${
                      categoryImage === p.src ? 'border-primary ring-1 ring-primary' : 'border-gray-200'
                    }`}
                  >
                    <div className="aspect-[3/1] bg-gray-100">
                      <img src={p.src} alt={p.label} className="w-full h-full object-cover" />
                    </div>
                    <div className="px-3 py-2 text-xs font-bold text-gray-700">{p.label}</div>
                  </button>
                ))}
              </div>
              {categoryImageError ? <div className="text-sm text-red-600 font-bold">{categoryImageError}</div> : null}
              <div className="flex justify-end pt-4 border-t border-gray-100">
                <button type="button" onClick={() => { setIsCategoryImageModalOpen(false); setEditingCategory(null); }} className="px-6 py-2.5 font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg mr-4 transition-colors">Annuler</button>
                <button
                  type="button"
                  onClick={saveCategoryImage}
                  disabled={savingCategoryImage}
                  className="px-8 py-2.5 bg-primary text-white font-bold rounded-lg hover:opacity-90 transition-all shadow-lg shadow-primary/20 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Check className="w-5 h-5" /> {savingCategoryImage ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isSubCategoryModalOpen && editingSubCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-800">Modifier sous-catégorie</h3>
              <button onClick={() => { setIsSubCategoryModalOpen(false); setEditingSubCategory(null); }} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"><X className="w-6 h-6" /></button>
            </div>
            <div className="p-6 space-y-6">
              <input type="text" placeholder="Nom" value={subCategoryForm.name} onChange={e => setSubCategoryForm({ ...subCategoryForm, name: e.target.value })} className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary outline-none transition-all" />
              <ImageUpload image={subCategoryForm.image} onImageChange={image => setSubCategoryForm({ ...subCategoryForm, image })} />
              <div className="flex justify-end pt-4 border-t border-gray-100">
                <button type="button" onClick={() => { setIsSubCategoryModalOpen(false); setEditingSubCategory(null); }} className="px-6 py-2.5 font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg mr-4 transition-colors">Annuler</button>
                <button type="button" onClick={saveSubCategory} className="px-8 py-2.5 bg-primary text-white font-bold rounded-lg hover:opacity-90 transition-all shadow-lg shadow-primary/20 flex items-center gap-2"><Check className="w-5 h-5" /> Enregistrer</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AdminSliders() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<Slide | null>(null);
  const [formData, setFormData] = useState({ title: '', subtitle: '', image: '', buttonText: '', link: '', category: '' });

  const fetchSlides = async () => {
    try { 
      const res = await adminApi.get('/sliders', { params: selectedCategory ? { category: selectedCategory } : {} }); 
      setSlides(res.data); 
    }
    catch (err) { console.error('Failed to fetch slides', err); }
  };

  const fetchCategories = async () => {
    try {
      const res = await adminApi.get('/categories');
      setCategories(res.data);
      if (!selectedCategory && res.data.length > 0 && res.data[0].subCategories.length > 0) {
        setSelectedCategory(''); // default "Tous"
      }
    } catch (err) { console.error('Failed to fetch categories', err); }
  };

  useEffect(() => { fetchCategories(); }, []);
  useEffect(() => { fetchSlides(); }, [selectedCategory]);

  const handleOpenModal = (slide?: Slide) => {
    if (slide) {
      setEditingSlide(slide);
      setFormData({ title: slide.title, subtitle: slide.subtitle, image: slide.image, buttonText: slide.buttonText, link: slide.link, category: slide.category || '' });
    } else {
      setEditingSlide(null);
      const defaultCategory = categories[0]?.name || '';
      setFormData({ title: '', subtitle: '', image: '', buttonText: '', link: '', category: defaultCategory });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => { setIsModalOpen(false); setEditingSlide(null); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const normalizedLink = (() => {
        const link = (formData.link || '').trim();
        if (!link) return link;
        if (link.startsWith('/products')) {
          return `/products?category=${encodeURIComponent((formData.category || '').toLowerCase())}`;
        }
        return link;
      })();

      const payload = { ...formData, link: normalizedLink };

      if (editingSlide) { await adminApi.put(`/sliders/${editingSlide.id}`, payload); }
      else { await adminApi.post('/sliders', payload); }
      fetchSlides();
      handleCloseModal();
    } catch (err) { console.error('Failed to save slide', err); }
  };

  const handleFileChange = (file: string) => {
    setFormData({ ...formData, image: file });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Gestion des Sliders</h2>
        <button onClick={() => handleOpenModal()} className="flex items-center justify-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/20"><Plus className="w-5 h-5" />Ajouter un slide</button>
      </div>

      <div className="flex items-center gap-3">
        <label className="text-sm font-bold text-gray-600">Filtrer par catégorie:</label>
        <div className="relative">
          <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} className="bg-gray-50 border-none rounded-xl py-2 px-4 pr-10 focus:ring-2 focus:ring-primary outline-none appearance-none cursor-pointer">
            <option value="">Tous</option>
            {categories.map(cat => (<option key={cat.id} value={cat.name}>{cat.name}</option>))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {slides.map(slide => (
          <div key={slide.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group">
            <div className="relative aspect-video">
              <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                <button onClick={() => handleOpenModal(slide)} className="p-3 bg-white text-gray-800 rounded-full hover:scale-110 transition-transform"><Pencil className="w-5 h-5" /></button>
                <button onClick={() => { if (window.confirm('Supprimer ce slide ?')) { adminApi.delete(`/sliders/${slide.id}`).then(fetchSlides); } }} className="p-3 bg-red-500 text-white rounded-full hover:scale-110 transition-transform"><Trash2 className="w-5 h-5" /></button>
              </div>
            </div>
            {slide.category && (
              <div className="p-4">
                <div className="font-bold text-gray-900">{slide.title}</div>
                <div className="text-sm text-gray-500 mt-1">{slide.subtitle}</div>
                <span className="px-2 py-0.5 inline-flex text-xs leading-5 font-bold rounded-full bg-primary/10 text-primary uppercase tracking-wide">
                  {slide.category}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-800">{editingSlide ? 'Modifier le slide' : 'Ajouter un nouveau slide'}</h3>
              <button onClick={handleCloseModal} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"><X className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="space-y-4">
                <input type="text" placeholder="Titre" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary outline-none transition-all" />
                <input type="text" placeholder="Sous-titre" value={formData.subtitle} onChange={e => setFormData({ ...formData, subtitle: e.target.value })} className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary outline-none transition-all" />

                <ImageUpload image={formData.image} onImageChange={handleFileChange} />

                <div className="relative">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Catégorie du slider</label>
                  <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary outline-none appearance-none transition-all cursor-pointer">
                    {categories.map(cat => (<option key={cat.id} value={cat.name}>{cat.name}</option>))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>

                <input type="text" placeholder="Texte du bouton" value={formData.buttonText} onChange={e => setFormData({ ...formData, buttonText: e.target.value })} className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary outline-none transition-all" />
                <input type="text" placeholder="Lien du bouton" value={formData.link} onChange={e => setFormData({ ...formData, link: e.target.value })} className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary outline-none transition-all" />
              </div>
              <div className="flex justify-end pt-4 border-t border-gray-100">
                <button type="button" onClick={handleCloseModal} className="px-6 py-2.5 font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg mr-4 transition-colors">Annuler</button>
                <button type="submit" className="px-8 py-2.5 bg-primary text-white font-bold rounded-lg hover:opacity-90 transition-all shadow-lg shadow-primary/20 flex items-center gap-2"><Check className="w-5 h-5" /> Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function AdminBrands() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [formData, setFormData] = useState({ name: '', logo: '' });

  const fetchBrands = async () => {
    try {
      const res = await adminApi.get('/brands');
      setBrands(res.data);
    } catch (err) { console.error('Failed to fetch brands', err); }
  };

  useEffect(() => { fetchBrands(); }, []);

  const openModal = (brand?: Brand) => {
    if (brand) {
      setEditingBrand(brand);
      setFormData({ name: brand.name, logo: brand.logo });
    } else {
      setEditingBrand(null);
      setFormData({ name: '', logo: '' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingBrand(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingBrand) {
        await adminApi.put(`/brands/${editingBrand.id}`, formData);
      } else {
        await adminApi.post('/brands', formData);
      }
      fetchBrands();
      closeModal();
    } catch (err) { console.error('Failed to save brand', err); }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Supprimer cette marque ?')) {
      try {
        await adminApi.delete(`/brands/${id}`);
        fetchBrands();
      } catch (err) { console.error('Failed to delete brand', err); }
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Gestion des Marques</h2>
        <button onClick={() => openModal()} className="flex items-center justify-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/20"><Plus className="w-5 h-5" />Ajouter une marque</button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {brands.map(brand => (
          <div key={brand.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <div className="aspect-square rounded-2xl bg-gray-50 border border-gray-100 overflow-hidden">
              {brand.logo ? <img src={brand.logo} alt={brand.name} className="w-full h-full object-cover" /> : null}
            </div>
            <div className="mt-3 flex items-center justify-between gap-2">
              <div className="text-sm font-bold text-gray-900 truncate">{brand.name}</div>
              <div className="flex items-center gap-1">
                <button onClick={() => openModal(brand)} className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg"><Pencil className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(brand.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-800">{editingBrand ? 'Modifier la marque' : 'Ajouter une marque'}</h3>
              <button onClick={closeModal} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"><X className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="space-y-4">
                <input type="text" placeholder="Nom de la marque" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary outline-none transition-all" />
                <ImageUpload image={formData.logo} onImageChange={(logo) => setFormData({ ...formData, logo })} />
              </div>
              <div className="flex justify-end pt-4 border-t border-gray-100">
                <button type="button" onClick={closeModal} className="px-6 py-2.5 font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg mr-4 transition-colors">Annuler</button>
                <button type="submit" className="px-8 py-2.5 bg-primary text-white font-bold rounded-lg hover:opacity-90 transition-all shadow-lg shadow-primary/20 flex items-center gap-2"><Check className="w-5 h-5" /> Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Order | null>(null);
  const [statusDraft, setStatusDraft] = useState<Order['status']>('pending');
  const [savingStatus, setSavingStatus] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const prevOrdersRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const fetchOrders = async () => {
    try {
      const res = await adminApi.get('/orders');
      const data: Order[] = res.data;
      
      // Notify on new order
      if (prevOrdersRef.current !== null && data.length > prevOrdersRef.current) {
        if (audioRef.current) {
          audioRef.current.play().catch(e => console.warn('Sound play failed', e));
        }
      }
      
      setOrders(data);
      prevOrdersRef.current = data.length;
    } catch (err) {
      console.error('Failed to fetch orders', err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Sound from mixkit.co (free ping)
    audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    fetchOrders();
    const id = window.setInterval(fetchOrders, 5000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (!selected) return;
    setStatusDraft(selected.status);
    setSaveError(null);
  }, [selected?.id]);

  const formatDate = (value: string) => {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleString('fr-FR');
  };

  const statusLabel = (value: Order['status']) => {
    switch (value) {
      case 'confirmed': return { text: 'Confirmée', className: 'bg-green-50 text-green-700' };
      case 'cancelled': return { text: 'Annulée', className: 'bg-red-50 text-red-700' };
      default: return { text: 'En attente', className: 'bg-yellow-50 text-yellow-700' };
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Commandes</h2>
        <button onClick={fetchOrders} className="px-5 py-2.5 rounded-lg font-bold bg-gray-100 hover:bg-gray-200 text-gray-800 transition-colors">
          Actualiser
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Commande</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Client</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Téléphone</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Total</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Statut</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-6 text-sm font-bold text-gray-500">Chargement...</td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-6 text-sm font-bold text-gray-500">Aucune commande</td>
              </tr>
            ) : (
              orders.map(order => {
                const status = statusLabel(order.status);
                const isRecentlyCreated = (new Date().getTime() - new Date(order.createdAt).getTime()) < 1000 * 60 * 10; // 10 minutes

                return (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-extrabold text-gray-900">#{order.id}</div>
                        {isRecentlyCreated && order.status === 'pending' && (
                          <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" title="Nouvelle commande"></span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">{formatDate(order.createdAt)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900">{`${order.customer.firstName || ''} ${order.customer.lastName || ''}`.trim()}</div>
                      <div className="text-xs text-gray-500 truncate max-w-[260px]">{order.customer.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                      <div className="flex items-center gap-2">
                        <span>{order.customer.phone}</span>
                        {order.customer.phone && (
                          <a 
                            href={`https://wa.me/${order.customer.phone.replace(/\D/g, '')}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="p-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                            title="WhatsApp"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-extrabold text-gray-900">{order.total.toFixed(2)} MAD</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${status.className}`}>{status.text}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={() => setSelected(order)} className="text-gray-400 hover:text-primary transition-colors">
                        <Pencil className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <div className="text-xl font-bold text-gray-900">Commande #{selected.id}</div>
                <div className="text-sm text-gray-500">{formatDate(selected.createdAt)}</div>
              </div>
              <button onClick={() => setSelected(null)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"><X className="w-6 h-6" /></button>
            </div>

            <div className="p-6 space-y-6">
              <div className="bg-white border border-gray-100 rounded-2xl p-4 flex flex-col md:flex-row md:items-center gap-4 justify-between">
                <div>
                  <div className="text-sm font-extrabold text-gray-900">Statut</div>
                  <div className="text-sm text-gray-500 mt-1">Change le statut et enregistre.</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <select
                      value={statusDraft}
                      onChange={(e) => setStatusDraft(e.target.value as Order['status'])}
                      className="bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-4 pr-10 focus:ring-2 focus:ring-primary outline-none appearance-none cursor-pointer font-bold text-gray-800"
                    >
                      <option value="pending">En attente</option>
                      <option value="confirmed">Confirmée</option>
                      <option value="cancelled">Annulée</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                  <button
                    type="button"
                    disabled={savingStatus || statusDraft === selected.status}
                    onClick={async () => {
                      setSaveError(null);
                      setSavingStatus(true);
                      try {
                        const res = await adminApi.patch(`/orders/${selected.id}/status`, { status: statusDraft });
                        const updated: Order = res.data;
                        setSelected(updated);
                        setOrders(prev => prev.map(o => (o.id === updated.id ? updated : o)));
                      } catch (err: any) {
                        const message = err?.response?.data?.message || err?.message || 'Erreur';
                        setSaveError(Array.isArray(message) ? message.join(', ') : String(message));
                      } finally {
                        setSavingStatus(false);
                      }
                    }}
                    className="px-5 py-2.5 rounded-xl font-extrabold bg-primary text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {savingStatus ? 'Enregistrement...' : 'Enregistrer'}
                  </button>
                </div>
                {saveError ? <div className="text-sm font-bold text-red-600">{saveError}</div> : null}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4">
                  <div className="text-sm font-extrabold text-gray-900">Client</div>
                  <div className="mt-2 text-sm text-gray-700 space-y-2">
                    <div className="font-bold">{`${selected.customer.firstName || ''} ${selected.customer.lastName || ''}`.trim()}</div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <a href={`mailto:${selected.customer.email}`} className="hover:text-primary underline-offset-2 hover:underline">{selected.customer.email}</a>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <a href={`tel:${selected.customer.phone}`} className="hover:text-primary underline-offset-2 hover:underline">{selected.customer.phone}</a>
                      {selected.customer.phone && (
                        <a 
                          href={`https://wa.me/${selected.customer.phone.replace(/\D/g, '')}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="p-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                          title="WhatsApp"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4">
                  <div className="text-sm font-extrabold text-gray-900">Livraison</div>
                  <div className="mt-2 text-sm text-gray-700">
                    <div>{[selected.customer.address, selected.customer.apartment].filter(Boolean).join(', ')}</div>
                    <div>{[selected.customer.city, selected.customer.postalCode].filter(Boolean).join(' ')}</div>
                    <div className="mt-2 font-bold">{selected.shippingMethod === 'casablanca' ? 'Casablanca' : 'Hors Casablanca'} · {selected.shippingCost.toFixed(2)} MAD</div>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 text-sm font-extrabold text-gray-900">Produits</div>
                <div className="divide-y divide-gray-100">
                  {selected.items.map((it, idx) => (
                    <div key={`${it.productId}-${idx}`} className="px-4 py-3 flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-gray-900 truncate">{it.name}</div>
                        <div className="text-xs text-gray-500">ID {it.productId} · {it.quantity} × {it.price.toFixed(2)} MAD</div>
                      </div>
                      <div className="text-sm font-extrabold text-gray-900">{(it.price * it.quantity).toFixed(2)} MAD</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-6">
                <div className="text-sm text-gray-600">Sous-total: <span className="font-extrabold text-gray-900">{selected.subtotal.toFixed(2)} MAD</span></div>
                <div className="text-sm text-gray-600">Total: <span className="font-extrabold text-gray-900">{selected.total.toFixed(2)} MAD</span></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AdminLoyalty() {
  const [members, setMembers] = useState<LoyaltyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<LoyaltyMember | null>(null);
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', phone: '', points: 0 });

  const fetchMembers = async () => {
    try {
      const res = await adminApi.get('/loyalty');
      setMembers(res.data);
    } catch (err) {
      console.error('Failed to fetch loyalty members', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMembers(); }, []);

  const openModal = (member?: LoyaltyMember) => {
    if (member) {
      setEditingMember(member);
      setFormData({ firstName: member.firstName, lastName: member.lastName, email: member.email, phone: member.phone, points: member.points });
    } else {
      setEditingMember(null);
      setFormData({ firstName: '', lastName: '', email: '', phone: '', points: 0 });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingMember) {
        await adminApi.patch(`/loyalty/${editingMember.id}`, formData);
      } else {
        await adminApi.post('/loyalty', formData);
      }
      fetchMembers();
      setIsModalOpen(false);
    } catch (err) {
      console.error('Failed to save loyalty member', err);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Supprimer ce membre ?')) {
      try {
        await adminApi.delete(`/loyalty/${id}`);
        fetchMembers();
      } catch (err) {
        console.error('Failed to delete member', err);
      }
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Membres Club Fidélité</h2>
        <button onClick={() => openModal()} className="flex items-center justify-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/20">
          <Plus className="w-5 h-5" /> Ajouter un membre
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Membre</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Contact</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Points</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={4} className="px-6 py-6 text-sm font-bold text-gray-500 text-center">Chargement...</td></tr>
            ) : members.length === 0 ? (
              <tr><td colSpan={4} className="px-6 py-6 text-sm font-bold text-gray-500 text-center">Aucun membre</td></tr>
            ) : (
              members.map(member => (
                <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-gray-900">{member.firstName} {member.lastName}</div>
                    <div className="text-xs text-gray-500">Inscrit le {new Date(member.createdAt).toLocaleDateString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{member.email}</div>
                    <div className="text-xs text-gray-500">{member.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full bg-amber-50 text-amber-700 border border-amber-100">
                      {member.points} pts
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openModal(member)} className="p-2 text-gray-400 hover:text-primary hover:bg-gray-100 rounded-lg transition-colors">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(member.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-800">{editingMember ? 'Modifier le membre' : 'Ajouter un membre'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"><X className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Prénom</label>
                  <input type="text" required value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-4 focus:ring-2 focus:ring-primary outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Nom</label>
                  <input type="text" required value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-4 focus:ring-2 focus:ring-primary outline-none" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Email</label>
                <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-4 focus:ring-2 focus:ring-primary outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Téléphone</label>
                <input type="text" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-4 focus:ring-2 focus:ring-primary outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Points de fidélité</label>
                <input type="number" required value={formData.points} onChange={e => setFormData({...formData, points: +e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-4 focus:ring-2 focus:ring-primary outline-none" />
              </div>
              <div className="flex justify-end pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg mr-4 transition-colors">Annuler</button>
                <button type="submit" className="px-8 py-2.5 bg-primary text-white font-bold rounded-lg hover:opacity-90 transition-all shadow-lg shadow-primary/20 flex items-center gap-2"><Check className="w-5 h-5" /> Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'products' | 'categories' | 'sliders' | 'brands' | 'orders' | 'loyalty'>('products');
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <img src="/logo-kids-videl.jpeg" alt="Logo" className="w-16 h-16 object-contain" />
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Espace Administration</h1>
          </div>
          <p className="text-gray-500 mt-1">Gérez votre boutique en toute simplicité.</p>
        </div>
      </div>

      <div className="flex border-b border-gray-200 overflow-x-auto no-scrollbar">
        <button onClick={() => setActiveTab('products')} className={`px-6 py-3 font-bold text-sm whitespace-nowrap ${activeTab === 'products' ? 'text-primary border-b-2 border-primary' : 'text-gray-500'}`}>Produits</button>
        <button onClick={() => setActiveTab('orders')} className={`px-6 py-3 font-bold text-sm whitespace-nowrap ${activeTab === 'orders' ? 'text-primary border-b-2 border-primary' : 'text-gray-500'}`}>Commandes</button>
        <button onClick={() => setActiveTab('loyalty')} className={`px-6 py-3 font-bold text-sm whitespace-nowrap ${activeTab === 'loyalty' ? 'text-primary border-b-2 border-primary' : 'text-gray-500'}`}>Fidélité</button>
        <button onClick={() => setActiveTab('categories')} className={`px-6 py-3 font-bold text-sm whitespace-nowrap ${activeTab === 'categories' ? 'text-primary border-b-2 border-primary' : 'text-gray-500'}`}>Catégories</button>
        <button onClick={() => setActiveTab('sliders')} className={`px-6 py-3 font-bold text-sm whitespace-nowrap ${activeTab === 'sliders' ? 'text-primary border-b-2 border-primary' : 'text-gray-500'}`}>Sliders</button>
        <button onClick={() => setActiveTab('brands')} className={`px-6 py-3 font-bold text-sm whitespace-nowrap ${activeTab === 'brands' ? 'text-primary border-b-2 border-primary' : 'text-gray-500'}`}>Marques</button>
      </div>

      <div>
        {activeTab === 'products' && <AdminProducts />}
        {activeTab === 'orders' && <AdminOrders />}
        {activeTab === 'loyalty' && <AdminLoyalty />}
        {activeTab === 'categories' && <AdminCategories />}
        {activeTab === 'sliders' && <AdminSliders />}
        {activeTab === 'brands' && <AdminBrands />}
      </div>
    </div>
  );
}
