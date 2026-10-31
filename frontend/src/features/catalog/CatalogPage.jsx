import { useState, useEffect } from 'react';
import { Search, Plus, ExternalLink } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { Modal } from '../../components/Modal';
import { catalogService } from '../../services/catalogService';
import { authService } from '../../services/authService';
import { useToast } from '../../components/Toast';

export function CatalogPage() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeProduct, setActiveProduct] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const { showToast } = useToast();

  const [newProd, setNewProd] = useState({
    name: '',
    vendor: '',
    category: 'ERP',
    pricingModel: 'Per User/Month',
    costScore: 75,
    securityScore: 90,
    scalabilityScore: 90,
    integrationScore: 85,
    featuresScore: 90,
    migrationComplexity: 'Medium',
    description: ''
  });

  const loadProducts = async () => {
    try {
      const data = await catalogService.getProducts();
      setProducts(data);
      setFilteredProducts(data);
      const user = await authService.getCurrentUser();
      setCurrentUser(user);
    } catch (err) {
      showToast(`Error loading products: ${err.message}`, 'danger');
    }
  };

  useEffect(() => {
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let result = products;
    if (selectedCategory !== 'All') {
      result = result.filter(p => p.category.toLowerCase() === selectedCategory.toLowerCase());
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.vendor.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q))
      );
    }
    setFilteredProducts(result);
  }, [search, selectedCategory, products]);

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (currentUser?.role !== 'Admin') {
      showToast('Admin role required to add products', 'warning');
      return;
    }
    try {
      const created = await catalogService.addProduct(newProd);
      showToast(`Added ${created.name} to catalog`, 'success');
      setIsAddModalOpen(false);
      loadProducts();
    } catch (err) {
      showToast(`Error adding product: ${err.message}`, 'danger');
    }
  };

  const categories = ['All', 'ERP', 'CRM', 'HCM', 'ITSM', 'Productivity', 'Analytics', 'Identity'];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Enterprise SaaS Product Catalog</h2>
          <p className="text-xs text-slate-400 mt-1">
            Curated enterprise cloud platforms seeded with standard architectural, security, and integration ratings.
          </p>
        </div>
        {currentUser?.role === 'Admin' && (
          <Button variant="primary" size="sm" onClick={() => setIsAddModalOpen(true)}>
            <Plus className="w-3.5 h-3.5" />
            <span>Add SaaS Product</span>
          </Button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-slate-900 border border-slate-800">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by product name, vendor, or capabilities..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Product Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredProducts.map((p) => (
          <Card key={p.ID} className="flex flex-col justify-between hover:border-slate-600 transition">
            <CardHeader className="pb-3">
              <div>
                <Badge variant="cyan">{p.category}</Badge>
                <CardTitle className="mt-2">{p.name}</CardTitle>
                <CardDescription>{p.vendor} • {p.businessFunction}</CardDescription>
              </div>
            </CardHeader>

            <CardContent className="space-y-3 pt-0">
              <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                {p.description}
              </p>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-center">
                <div className="bg-slate-800/40 p-2 rounded-lg border border-slate-700/40">
                  <span className="text-[10px] text-slate-400 block">Security</span>
                  <strong className="text-xs text-blue-400">{p.securityScore}/100</strong>
                </div>
                <div className="bg-slate-800/40 p-2 rounded-lg border border-slate-700/40">
                  <span className="text-[10px] text-slate-400 block">Scalability</span>
                  <strong className="text-xs text-cyan-400">{p.scalabilityScore}/100</strong>
                </div>
                <div className="bg-slate-800/40 p-2 rounded-lg border border-slate-700/40">
                  <span className="text-[10px] text-slate-400 block">Cost Fit</span>
                  <strong className="text-xs text-amber-400">{p.costScore}/100</strong>
                </div>
              </div>
            </CardContent>

            <CardFooter>
              <span className="text-[11px] text-slate-400">{p.pricingModel}</span>
              <Button variant="ghost" size="sm" onClick={() => setActiveProduct(p)}>
                <span>Details</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Product Inspection Modal */}
      <Modal
        isOpen={!!activeProduct}
        onClose={() => setActiveProduct(null)}
        title={activeProduct?.name || ''}
        subtitle={`${activeProduct?.vendor} • ${activeProduct?.category} (${activeProduct?.businessFunction})`}
      >
        {activeProduct && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60">
                <span className="text-slate-400 block">Pricing Model</span>
                <strong className="text-white text-sm">{activeProduct.pricingModel} (Cost: {activeProduct.costScore}/100)</strong>
              </div>
              <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60">
                <span className="text-slate-400 block">Deployment Type</span>
                <strong className="text-white text-sm">{activeProduct.deploymentType}</strong>
              </div>
              <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60">
                <span className="text-slate-400 block">Security & Certifications</span>
                <strong className="text-white text-sm">{activeProduct.securityRating} ({activeProduct.securityScore}/100)</strong>
              </div>
              <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60">
                <span className="text-slate-400 block">Integration Protocols</span>
                <strong className="text-white text-sm">{activeProduct.integrationCapability} ({activeProduct.integrationScore}/100)</strong>
              </div>
              <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60">
                <span className="text-slate-400 block">Migration Complexity</span>
                <strong className="text-white text-sm">{activeProduct.migrationComplexity} Complexity</strong>
              </div>
              <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60">
                <span className="text-slate-400 block">Scalability Rating</span>
                <strong className="text-white text-sm">{activeProduct.scalabilityRating} ({activeProduct.scalabilityScore}/100)</strong>
              </div>
            </div>

            <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-700/60">
              <span className="text-slate-400 block font-semibold mb-1">Architecture & Capabilities Overview</span>
              <p className="text-slate-300 leading-relaxed">{activeProduct.description}</p>
            </div>
          </div>
        )}
      </Modal>

      {/* Admin Add Product Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add SaaS Product to Catalog"
        subtitle="Catalog administrator maintenance interface"
      >
        <form onSubmit={handleAddProduct} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 mb-1">Product Name *</label>
              <input
                type="text"
                required
                value={newProd.name}
                onChange={(e) => setNewProd({ ...newProd, name: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 mb-1">Vendor *</label>
              <input
                type="text"
                required
                value={newProd.vendor}
                onChange={(e) => setNewProd({ ...newProd, vendor: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 mb-1">Category *</label>
              <select
                value={newProd.category}
                onChange={(e) => setNewProd({ ...newProd, category: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500"
              >
                {categories.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-slate-300 mb-1">Pricing Model</label>
              <input
                type="text"
                value={newProd.pricingModel}
                onChange={(e) => setNewProd({ ...newProd, pricingModel: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-300 mb-1">Cost Score (0-100)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={newProd.costScore}
                onChange={(e) => setNewProd({ ...newProd, costScore: Number(e.target.value) })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 mb-1">Security Score (0-100)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={newProd.securityScore}
                onChange={(e) => setNewProd({ ...newProd, securityScore: Number(e.target.value) })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 mb-1">Scalability (0-100)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={newProd.scalabilityScore}
                onChange={(e) => setNewProd({ ...newProd, scalabilityScore: Number(e.target.value) })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 mb-1">Description</label>
            <textarea
              rows={2}
              value={newProd.description}
              onChange={(e) => setNewProd({ ...newProd, description: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save to Catalog
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
