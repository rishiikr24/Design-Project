import { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  ExternalLink,
  Table,
  LayoutGrid,
  Shield,
  Server,
  DollarSign,
  Layers,
  Check,
  X,
  SlidersHorizontal,
  Scale,
  Sparkles,
  ArrowRight,
  Info
} from 'lucide-react';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { Modal } from '../../components/Modal';
import { catalogService } from '../../services/catalogService';
import { authService } from '../../services/authService';
import { useToast } from '../../components/Toast';

const CATEGORIES = ['All', 'ERP', 'CRM', 'HCM', 'ITSM', 'Productivity', 'Analytics', 'Identity'];

export function CatalogPage() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedVendor, setSelectedVendor] = useState('All');
  const [selectedPricing, setSelectedPricing] = useState('All');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [activeProduct, setActiveProduct] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  
  // Selected for comparison (up to 4 products)
  const [selectedCompareIds, setSelectedCompareIds] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
    description: '',
    deploymentType: 'Multi-tenant Public Cloud',
    targetOrganisation: 'Enterprise',
    apiAvailable: true
  });

  const loadProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await catalogService.getProducts();
      setProducts(data);
      setFilteredProducts(data);
    } catch (err) {
      setError(err.message || 'Error loading SaaS products catalog');
      showToast(`Error loading products: ${err.message}`, 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // Filter & Search Logic
  useEffect(() => {
    let result = products;

    if (selectedCategory !== 'All') {
      result = result.filter(p => p.category && p.category.toLowerCase() === selectedCategory.toLowerCase());
    }

    if (selectedVendor !== 'All') {
      result = result.filter(p => p.vendor && p.vendor.toLowerCase() === selectedVendor.toLowerCase());
    }

    if (selectedPricing !== 'All') {
      result = result.filter(p => p.pricingModel && p.pricingModel.toLowerCase() === selectedPricing.toLowerCase());
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(p =>
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.vendor && p.vendor.toLowerCase().includes(q)) ||
        (p.category && p.category.toLowerCase().includes(q)) ||
        (p.businessFunction && p.businessFunction.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q)) ||
        (p.capabilities && p.capabilities.some(c => c.toLowerCase().includes(q)))
      );
    }

    setFilteredProducts(result);
  }, [search, selectedCategory, selectedVendor, selectedPricing, products]);

  // Unique vendor & pricing lists for dropdown filters
  const vendorList = ['All', ...new Set(products.map(p => p.vendor).filter(Boolean))];
  const pricingList = ['All', ...new Set(products.map(p => p.pricingModel).filter(Boolean))];

  // Compare Toggle
  const toggleCompare = (productId, e) => {
    if (e) e.stopPropagation();
    if (selectedCompareIds.includes(productId)) {
      setSelectedCompareIds(selectedCompareIds.filter(id => id !== productId));
    } else {
      if (selectedCompareIds.length >= 4) {
        showToast('You can compare a maximum of 4 SaaS products at once.', 'warning');
        return;
      }
      setSelectedCompareIds([...selectedCompareIds, productId]);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      const created = await catalogService.addProduct(newProd);
      showToast(`Added ${created.name} to catalog`, 'success');
      setIsAddModalOpen(false);
      setNewProd({
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
        description: '',
        deploymentType: 'Multi-tenant Public Cloud',
        targetOrganisation: 'Enterprise',
        apiAvailable: true
      });
      loadProducts();
    } catch (err) {
      showToast(`Error adding product: ${err.message}`, 'danger');
    }
  };

  const comparedProducts = products.filter(p => selectedCompareIds.includes(p.ID || p.id));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#247C78]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto my-16 p-6 rounded-2xl bg-white border border-red-200 text-center space-y-4 shadow-sm">
        <h3 className="text-base font-bold text-[#102B46]">Error Loading Catalog</h3>
        <p className="text-xs text-red-600">{error}</p>
        <Button variant="primary" size="sm" onClick={loadProducts}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#DCE5EA]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <h2 className="text-2xl font-bold text-[#102B46] tracking-tight">SaaS Product Catalogue</h2>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#247C78]/10 text-[#247C78] border border-[#247C78]/20">
              Module 3
            </span>
          </div>
          <p className="text-sm text-[#718096]">
            Discover and evaluate cloud software solutions for enterprise transformation.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Comparison floating badge */}
          {selectedCompareIds.length > 0 && (
            <Button
              variant="teal"
              size="sm"
              onClick={() => setIsCompareModalOpen(true)}
              className="animate-pulse"
            >
              <Scale className="w-3.5 h-3.5 mr-1.5" />
              <span>Compare Selected ({selectedCompareIds.length})</span>
            </Button>
          )}

          {/* View Mode Toggle */}
          <div className="flex items-center bg-[#F4F7FA] border border-[#DCE5EA] rounded-xl p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition ${
                viewMode === 'grid'
                  ? 'bg-white text-[#102B46] font-bold shadow-xs'
                  : 'text-[#718096] hover:text-[#102B46]'
              }`}
              title="Grid Cards View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Grid</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition ${
                viewMode === 'table'
                  ? 'bg-white text-[#102B46] font-bold shadow-xs'
                  : 'text-[#718096] hover:text-[#102B46]'
              }`}
              title="Table View"
            >
              <Table className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Table</span>
            </button>
          </div>

          <Button variant="primary" size="sm" onClick={() => setIsAddModalOpen(true)}>
            <Plus className="w-3.5 h-3.5 mr-1" />
            <span>Add SaaS Product</span>
          </Button>
        </div>
      </div>

      {/* 2. Search & Multifaceted Filter Bar */}
      <div className="bg-white border border-[#DCE5EA] rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by product name, vendor, category or capabilities..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 bg-[#F4F7FA] border border-[#DCE5EA] rounded-xl pl-10 pr-3.5 text-xs text-[#263746] focus:outline-none focus:ring-2 focus:ring-[#247C78]/20 focus:border-[#247C78] transition"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Vendor Filter Dropdown */}
          <div className="w-full md:w-52">
            <select
              value={selectedVendor}
              onChange={(e) => setSelectedVendor(e.target.value)}
              className="w-full h-10 bg-[#F4F7FA] border border-[#DCE5EA] rounded-xl px-3 text-xs text-[#263746] focus:outline-none focus:border-[#247C78] cursor-pointer"
            >
              <option value="All">All Vendors</option>
              {vendorList.filter(v => v !== 'All').map(v => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </div>

          {/* Pricing Model Filter */}
          <div className="w-full md:w-52">
            <select
              value={selectedPricing}
              onChange={(e) => setSelectedPricing(e.target.value)}
              className="w-full h-10 bg-[#F4F7FA] border border-[#DCE5EA] rounded-xl px-3 text-xs text-[#263746] focus:outline-none focus:border-[#247C78] cursor-pointer"
            >
              <option value="All">All Pricing Models</option>
              {pricingList.filter(p => p !== 'All').map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-1">
          {CATEGORIES.map((cat) => {
            const count = cat === 'All' ? products.length : products.filter(p => p.category === cat).length;
            const isCatActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition shrink-0 ${
                  isCatActive
                    ? 'bg-[#247C78] text-white font-bold shadow-xs'
                    : 'bg-[#F4F7FA] text-[#718096] border border-[#DCE5EA] hover:bg-slate-100 hover:text-[#102B46]'
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Product Display (Grid or Table) */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white border border-[#DCE5EA] rounded-2xl p-12 text-center space-y-3">
          <p className="text-sm font-semibold text-[#102B46]">No SaaS products match your current filters.</p>
          <p className="text-xs text-[#718096]">Try adjusting your search terms, vendor, or category filter.</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearch('');
              setSelectedCategory('All');
              setSelectedVendor('All');
              setSelectedPricing('All');
            }}
          >
            Clear All Filters
          </Button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProducts.map((p) => {
            const isCompared = selectedCompareIds.includes(p.ID || p.id);
            return (
              <div
                key={p.ID || p.id}
                className={`bg-white border rounded-2xl p-5 shadow-2xs flex flex-col justify-between transition ${
                  isCompared ? 'border-[#247C78] ring-2 ring-[#247C78]/20' : 'border-[#DCE5EA] hover:border-[#247C78]/40'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#F4F7FA] text-[#247C78] border border-[#DCE5EA]">
                        {p.category}
                      </span>
                      <h4 className="text-base font-bold text-[#102B46] mt-2 leading-tight">{p.name}</h4>
                      <p className="text-xs text-[#718096]">{p.vendor} &middot; {p.businessFunction}</p>
                    </div>
                    <span className="text-sm font-extrabold text-[#102B46] bg-[#F4F7FA] px-2.5 py-1 rounded-xl border border-[#DCE5EA]">
                      {p.overallScore || 85}<span className="text-[10px] text-[#718096] font-normal">/100</span>
                    </span>
                  </div>

                  <p className="text-xs text-[#263746] line-clamp-2 leading-relaxed">
                    {p.description}
                  </p>

                  {/* 3 Metric Badges */}
                  <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-[#DCE5EA] text-center">
                    <div className="p-2 rounded-lg bg-[#F4F7FA] border border-[#DCE5EA]">
                      <span className="text-[10px] text-[#718096] block">Security</span>
                      <strong className="text-xs text-[#102B46]">{p.securityScore}/100</strong>
                    </div>
                    <div className="p-2 rounded-lg bg-[#F4F7FA] border border-[#DCE5EA]">
                      <span className="text-[10px] text-[#718096] block">Scalability</span>
                      <strong className="text-xs text-[#247C78]">{p.scalabilityScore}/100</strong>
                    </div>
                    <div className="p-2 rounded-lg bg-[#F4F7FA] border border-[#DCE5EA]">
                      <span className="text-[10px] text-[#718096] block">Cost Fit</span>
                      <strong className="text-xs text-amber-700">{p.costScore}/100</strong>
                    </div>
                  </div>

                  {/* Pricing Model & Deployment Tag */}
                  <div className="flex items-center justify-between text-[11px] text-[#718096] pt-1">
                    <span className="truncate">{p.pricingModel}</span>
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-100">{p.migrationComplexity} Migr.</span>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-4 border-t border-[#DCE5EA] flex items-center justify-between mt-3">
                  <button
                    type="button"
                    onClick={(e) => toggleCompare(p.ID || p.id, e)}
                    className={`text-xs font-semibold px-2.5 py-1 rounded-lg border transition flex items-center gap-1.5 ${
                      isCompared
                        ? 'bg-[#247C78] text-white border-[#247C78]'
                        : 'bg-white text-[#718096] border-[#DCE5EA] hover:border-[#247C78]'
                    }`}
                  >
                    <Scale className="w-3.5 h-3.5" />
                    <span>{isCompared ? 'Comparing' : 'Compare'}</span>
                  </button>

                  <Button variant="outline" size="sm" onClick={() => setActiveProduct(p)}>
                    <span>Details</span>
                    <ExternalLink className="w-3.5 h-3.5 ml-1 text-[#247C78]" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="overflow-x-auto border border-[#DCE5EA] rounded-2xl bg-white shadow-2xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F4F7FA] text-[#263746] border-b border-[#DCE5EA] font-semibold">
              <tr>
                <th className="p-3.5">Platform & Vendor</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Pricing Model</th>
                <th className="p-3.5 text-center">Security</th>
                <th className="p-3.5 text-center">Scalability</th>
                <th className="p-3.5 text-center">Cost Fit</th>
                <th className="p-3.5 text-center">Integration</th>
                <th className="p-3.5 text-center">Complexity</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCE5EA]">
              {filteredProducts.map((p) => {
                const isCompared = selectedCompareIds.includes(p.ID || p.id);
                return (
                  <tr key={p.ID || p.id} className="hover:bg-[#F4F7FA]/70 transition">
                    <td className="p-3.5">
                      <div className="font-bold text-[#102B46]">{p.name}</div>
                      <div className="text-[11px] text-[#718096]">{p.vendor}</div>
                    </td>
                    <td className="p-3.5">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#247C78]/10 text-[#247C78] border border-[#247C78]/20">
                        {p.category}
                      </span>
                    </td>
                    <td className="p-3.5 text-[#263746]">{p.pricingModel}</td>
                    <td className="p-3.5 text-center font-bold text-[#102B46]">{p.securityScore}</td>
                    <td className="p-3.5 text-center font-bold text-[#247C78]">{p.scalabilityScore}</td>
                    <td className="p-3.5 text-center font-bold text-amber-700">{p.costScore}</td>
                    <td className="p-3.5 text-center font-bold text-emerald-700">{p.integrationScore}</td>
                    <td className="p-3.5 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          p.migrationComplexity === 'High'
                            ? 'bg-red-100 text-red-800'
                            : p.migrationComplexity === 'Medium'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {p.migrationComplexity}
                      </span>
                    </td>
                    <td className="p-3.5 text-right space-x-2">
                      <button
                        onClick={() => toggleCompare(p.ID || p.id)}
                        className={`px-2 py-1 rounded text-xs border ${
                          isCompared
                            ? 'bg-[#247C78] text-white border-[#247C78]'
                            : 'bg-white text-[#718096] border-[#DCE5EA]'
                        }`}
                      >
                        {isCompared ? '✓ Compare' : '+ Compare'}
                      </button>
                      <Button variant="ghost" size="sm" onClick={() => setActiveProduct(p)}>
                        Details
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* 4. Product Details Modal */}
      <Modal
        isOpen={Boolean(activeProduct)}
        onClose={() => setActiveProduct(null)}
        title={activeProduct ? activeProduct.name : 'Product Specifications'}
        subtitle={activeProduct ? `${activeProduct.vendor} • ${activeProduct.category} (${activeProduct.businessFunction})` : ''}
        maxWidth="max-w-2xl"
      >
        {activeProduct && (
          <div className="space-y-5 text-xs text-[#263746]">
            {/* Description */}
            <div className="p-4 bg-[#F4F7FA] rounded-2xl border border-[#DCE5EA] leading-relaxed">
              {activeProduct.description}
            </div>

            {/* Core Dimensions Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3.5 bg-white rounded-xl border border-[#DCE5EA] shadow-2xs">
                <div className="flex items-center gap-1.5 text-[#718096] mb-1">
                  <DollarSign className="w-3.5 h-3.5 text-amber-600" />
                  <span className="font-semibold text-[11px]">Pricing Model</span>
                </div>
                <div className="font-bold text-[#102B46] text-sm">{activeProduct.pricingModel}</div>
                <div className="text-[10px] text-amber-700 mt-0.5">Cost Fit: {activeProduct.costScore}/100</div>
              </div>

              <div className="p-3.5 bg-white rounded-xl border border-[#DCE5EA] shadow-2xs">
                <div className="flex items-center gap-1.5 text-[#718096] mb-1">
                  <Shield className="w-3.5 h-3.5 text-[#102B46]" />
                  <span className="font-semibold text-[11px]">Security Tier</span>
                </div>
                <div className="font-bold text-[#102B46] text-sm">{activeProduct.securityRating || 'SOC2 / ISO27001'}</div>
                <div className="text-[10px] text-[#247C78] mt-0.5">Security Score: {activeProduct.securityScore}/100</div>
              </div>

              <div className="p-3.5 bg-white rounded-xl border border-[#DCE5EA] shadow-2xs">
                <div className="flex items-center gap-1.5 text-[#718096] mb-1">
                  <Server className="w-3.5 h-3.5 text-[#247C78]" />
                  <span className="font-semibold text-[11px]">Scalability Tier</span>
                </div>
                <div className="font-bold text-[#102B46] text-sm">{activeProduct.scalabilityRating || 'Enterprise Cloud'}</div>
                <div className="text-[10px] text-[#247C78] mt-0.5">Scale Score: {activeProduct.scalabilityScore}/100</div>
              </div>

              <div className="p-3.5 bg-white rounded-xl border border-[#DCE5EA] shadow-2xs">
                <div className="flex items-center gap-1.5 text-[#718096] mb-1">
                  <Layers className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="font-semibold text-[11px]">API Integration</span>
                </div>
                <div className="font-bold text-[#102B46] text-sm">{activeProduct.integrationCapability || 'Open REST APIs'}</div>
                <div className="text-[10px] text-emerald-700 mt-0.5">API Score: {activeProduct.integrationScore}/100</div>
              </div>

              <div className="p-3.5 bg-white rounded-xl border border-[#DCE5EA] shadow-2xs">
                <span className="text-[#718096] block font-semibold text-[11px] mb-1">Migration Complexity</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                  {activeProduct.migrationComplexity} Complexity
                </span>
              </div>

              <div className="p-3.5 bg-white rounded-xl border border-[#DCE5EA] shadow-2xs">
                <span className="text-[#718096] block font-semibold text-[11px] mb-1">Deployment Topology</span>
                <div className="font-semibold text-[#102B46]">{activeProduct.deploymentType}</div>
              </div>
            </div>

            {/* Key Capabilities */}
            {activeProduct.capabilities && activeProduct.capabilities.length > 0 && (
              <div className="space-y-2 pt-2">
                <span className="font-bold text-[#102B46] block text-xs uppercase tracking-wider">
                  Key Enterprise Capabilities
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {activeProduct.capabilities.map((c, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg bg-[#F4F7FA] border border-[#DCE5EA] text-[11px] font-medium text-[#263746]"
                    >
                      ✓ {c}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-between items-center pt-3 border-t border-[#DCE5EA]">
              <button
                type="button"
                onClick={() => {
                  toggleCompare(activeProduct.ID || activeProduct.id);
                  setActiveProduct(null);
                }}
                className="text-xs text-[#247C78] font-bold hover:underline"
              >
                {selectedCompareIds.includes(activeProduct.ID || activeProduct.id)
                  ? 'Remove from comparison'
                  : 'Add to product comparison'}
              </button>
              <Button variant="primary" size="sm" onClick={() => setActiveProduct(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* 5. Product Comparison Modal (2–4 Selected Products) */}
      <Modal
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        title="Side-by-Side SaaS Product Comparison"
        subtitle={`Benchmarking ${comparedProducts.length} selected enterprise platform${comparedProducts.length > 1 ? 's' : ''}`}
        maxWidth="max-w-4xl"
      >
        <div className="space-y-5 text-xs text-[#263746]">
          {comparedProducts.length < 2 ? (
            <div className="p-8 text-center space-y-3 bg-[#F4F7FA] rounded-2xl border border-[#DCE5EA]">
              <Scale className="w-8 h-8 text-[#247C78] mx-auto" />
              <p className="font-semibold text-[#102B46]">Select at least 2 products to benchmark side-by-side.</p>
              <p className="text-xs text-[#718096]">Click the &quot;Compare&quot; button on any product card in the catalog.</p>
            </div>
          ) : (
            <div className="overflow-x-auto border border-[#DCE5EA] rounded-2xl">
              <table className="w-full text-left">
                <thead className="bg-[#F4F7FA] border-b border-[#DCE5EA]">
                  <tr>
                    <th className="p-3.5 font-bold text-[#102B46] w-40">Criteria</th>
                    {comparedProducts.map(p => (
                      <th key={p.ID || p.id} className="p-3.5 font-bold text-[#102B46] text-center min-w-[160px]">
                        <div>{p.name}</div>
                        <div className="text-[10px] font-normal text-[#718096]">{p.vendor}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DCE5EA]">
                  <tr>
                    <td className="p-3 font-semibold text-[#102B46]">Category & Function</td>
                    {comparedProducts.map(p => (
                      <td key={p.ID || p.id} className="p-3 text-center text-[11px]">
                        <span className="font-semibold text-[#247C78]">{p.category}</span>
                        <div className="text-[#718096]">{p.businessFunction}</div>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-[#102B46]">Pricing Model</td>
                    {comparedProducts.map(p => (
                      <td key={p.ID || p.id} className="p-3 text-center font-medium">
                        {p.pricingModel}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-[#102B46]">Cost Fit Score</td>
                    {comparedProducts.map(p => (
                      <td key={p.ID || p.id} className="p-3 text-center font-bold text-amber-700">
                        {p.costScore}/100
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-[#102B46]">Security & Compliance</td>
                    {comparedProducts.map(p => (
                      <td key={p.ID || p.id} className="p-3 text-center font-bold text-[#102B46]">
                        {p.securityScore}/100
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-[#102B46]">Scalability Score</td>
                    {comparedProducts.map(p => (
                      <td key={p.ID || p.id} className="p-3 text-center font-bold text-[#247C78]">
                        {p.scalabilityScore}/100
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-[#102B46]">Integration & APIs</td>
                    {comparedProducts.map(p => (
                      <td key={p.ID || p.id} className="p-3 text-center font-bold text-emerald-700">
                        {p.integrationScore}/100
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-[#102B46]">Feature Richness</td>
                    {comparedProducts.map(p => (
                      <td key={p.ID || p.id} className="p-3 text-center font-bold text-purple-700">
                        {p.featuresScore}/100
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-[#102B46]">Migration Complexity</td>
                    {comparedProducts.map(p => (
                      <td key={p.ID || p.id} className="p-3 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#F4F7FA]">
                          {p.migrationComplexity}
                        </span>
                      </td>
                    ))}
                  </tr>
                  <tr className="bg-[#F4F7FA]/70">
                    <td className="p-3.5 font-bold text-[#102B46]">Overall Benchmark</td>
                    {comparedProducts.map(p => (
                      <td key={p.ID || p.id} className="p-3.5 text-center">
                        <span className="text-base font-extrabold text-[#247C78]">
                          {p.overallScore || Math.round((p.costScore + p.securityScore + p.scalabilityScore + p.integrationScore + p.featuresScore) / 5)}/100
                        </span>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          <div className="flex justify-between items-center pt-3 border-t border-[#DCE5EA]">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedCompareIds([])}
            >
              Clear Comparison
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsCompareModalOpen(false)}
            >
              Done
            </Button>
          </div>
        </div>
      </Modal>

      {/* 6. Modal: Add SaaS Product */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Enterprise SaaS Product"
        subtitle="Catalog a new cloud platform for multi-criteria recommendation scoring"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleAddProduct} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#263746] mb-1">Product Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Workday Adaptive"
                value={newProd.name}
                onChange={(e) => setNewProd({ ...newProd, name: e.target.value })}
                className="w-full bg-white border border-[#DCE5EA] rounded-xl p-2.5 text-[#263746] focus:outline-none focus:border-[#247C78]"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#263746] mb-1">Vendor *</label>
              <input
                type="text"
                required
                placeholder="e.g. Workday"
                value={newProd.vendor}
                onChange={(e) => setNewProd({ ...newProd, vendor: e.target.value })}
                className="w-full bg-white border border-[#DCE5EA] rounded-xl p-2.5 text-[#263746] focus:outline-none focus:border-[#247C78]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#263746] mb-1">Category *</label>
              <select
                value={newProd.category}
                onChange={(e) => setNewProd({ ...newProd, category: e.target.value })}
                className="w-full bg-white border border-[#DCE5EA] rounded-xl p-2.5 text-[#263746] focus:outline-none focus:border-[#247C78] cursor-pointer"
              >
                {CATEGORIES.filter(c => c !== 'All').map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-[#263746] mb-1">Pricing Model *</label>
              <select
                value={newProd.pricingModel}
                onChange={(e) => setNewProd({ ...newProd, pricingModel: e.target.value })}
                className="w-full bg-white border border-[#DCE5EA] rounded-xl p-2.5 text-[#263746] focus:outline-none focus:border-[#247C78] cursor-pointer"
              >
                <option value="Per User/Month">Per User/Month</option>
                <option value="Tiered Enterprise">Tiered Enterprise</option>
                <option value="Usage-based">Usage-based</option>
                <option value="Annual License">Annual License</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-[#263746] mb-1">Description</label>
            <textarea
              rows={2}
              placeholder="Enterprise capabilities and architectural fit..."
              value={newProd.description}
              onChange={(e) => setNewProd({ ...newProd, description: e.target.value })}
              className="w-full bg-white border border-[#DCE5EA] rounded-xl p-2.5 text-[#263746] focus:outline-none focus:border-[#247C78]"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block font-semibold text-[#263746] mb-1">Cost Score (0-100)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={newProd.costScore}
                onChange={(e) => setNewProd({ ...newProd, costScore: Number(e.target.value) })}
                className="w-full bg-white border border-[#DCE5EA] rounded-xl p-2 text-[#263746] focus:outline-none focus:border-[#247C78]"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#263746] mb-1">Security Score</label>
              <input
                type="number"
                min="0"
                max="100"
                value={newProd.securityScore}
                onChange={(e) => setNewProd({ ...newProd, securityScore: Number(e.target.value) })}
                className="w-full bg-white border border-[#DCE5EA] rounded-xl p-2 text-[#263746] focus:outline-none focus:border-[#247C78]"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#263746] mb-1">Scalability Score</label>
              <input
                type="number"
                min="0"
                max="100"
                value={newProd.scalabilityScore}
                onChange={(e) => setNewProd({ ...newProd, scalabilityScore: Number(e.target.value) })}
                className="w-full bg-white border border-[#DCE5EA] rounded-xl p-2 text-[#263746] focus:outline-none focus:border-[#247C78]"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#DCE5EA]">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsAddModalOpen(false)}>
              <X className="w-3.5 h-3.5 mr-1" />
              <span>Cancel</span>
            </Button>
            <Button type="submit" variant="primary" size="sm">
              <Plus className="w-3.5 h-3.5 mr-1" />
              <span>Add to Catalogue</span>
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
