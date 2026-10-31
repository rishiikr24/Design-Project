import { useState, useEffect } from 'react';
import { Search, Plus, ExternalLink, Table, LayoutGrid, Shield, Server, DollarSign, Layers } from 'lucide-react';
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
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'
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
    description: '',
    deploymentType: 'Multi-tenant Public Cloud',
    targetOrganisation: 'Enterprise',
    apiAvailable: true
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
    const handleRoleChanged = (e) => {
      if (e.detail) setCurrentUser(e.detail);
    };
    window.addEventListener('saas:role_changed', handleRoleChanged);
    return () => window.removeEventListener('saas:role_changed', handleRoleChanged);
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
        (p.businessFunction && p.businessFunction.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q))
      );
    }
    setFilteredProducts(result);
  }, [search, selectedCategory, products]);

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (currentUser?.role !== 'Admin') {
      showToast('Admin role required to add products to the catalog', 'warning');
      return;
    }
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

  const categories = ['All', 'ERP', 'CRM', 'HCM', 'ITSM', 'Productivity', 'Analytics', 'Identity'];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-bold text-white tracking-tight">Enterprise SaaS Product Catalog</h2>
            <Badge variant="cyan">Module 3</Badge>
          </div>
          <p className="text-xs text-slate-400">
            Ten curated enterprise cloud platforms seeded from repository data, benchmarked on security, scalability, cost fit, and integration readiness.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* View mode toggle */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md text-xs flex items-center gap-1 transition ${
                viewMode === 'table' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
              title="Table View"
            >
              <Table className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Table</span>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md text-xs flex items-center gap-1 transition ${
                viewMode === 'grid' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
              title="Grid Cards View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Grid</span>
            </button>
          </div>

          {currentUser?.role === 'Admin' && (
            <Button variant="primary" size="sm" onClick={() => setIsAddModalOpen(true)}>
              <Plus className="w-3.5 h-3.5" />
              <span>Add SaaS Product</span>
            </Button>
          )}
        </div>
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
          {categories.map((cat) => {
            const count = cat === 'All' ? products.length : products.filter(p => p.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white font-semibold shadow'
                    : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Primary Table View */}
      {viewMode === 'table' ? (
        <div className="overflow-x-auto border border-slate-800 rounded-xl bg-slate-900/60">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/80 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-3">Platform / Vendor</th>
                <th className="p-3">Category</th>
                <th className="p-3">Business Function</th>
                <th className="p-3">Pricing Model</th>
                <th className="p-3 text-center">Security</th>
                <th className="p-3 text-center">Scalability</th>
                <th className="p-3 text-center">Cost Fit</th>
                <th className="p-3 text-center">Integration</th>
                <th className="p-3 text-center">Complexity</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-slate-500">
                    No SaaS products match current filter criteria.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => (
                  <tr key={p.ID} className="hover:bg-slate-800/40 transition">
                    <td className="p-3">
                      <div className="font-semibold text-white">{p.name}</div>
                      <div className="text-[11px] text-slate-400">{p.vendor}</div>
                    </td>
                    <td className="p-3">
                      <Badge variant="cyan">{p.category}</Badge>
                    </td>
                    <td className="p-3 text-slate-300 max-w-xs truncate" title={p.businessFunction}>
                      {p.businessFunction}
                    </td>
                    <td className="p-3 text-slate-400 font-mono text-[11px]">{p.pricingModel}</td>
                    <td className="p-3 text-center">
                      <span className="font-semibold text-blue-400">{p.securityScore}</span>
                      <span className="text-[10px] text-slate-500">/100</span>
                    </td>
                    <td className="p-3 text-center">
                      <span className="font-semibold text-cyan-400">{p.scalabilityScore}</span>
                      <span className="text-[10px] text-slate-500">/100</span>
                    </td>
                    <td className="p-3 text-center">
                      <span className="font-semibold text-amber-400">{p.costScore}</span>
                      <span className="text-[10px] text-slate-500">/100</span>
                    </td>
                    <td className="p-3 text-center">
                      <span className="font-semibold text-emerald-400">{p.integrationScore}</span>
                      <span className="text-[10px] text-slate-500">/100</span>
                    </td>
                    <td className="p-3 text-center">
                      <Badge variant={p.migrationComplexity === 'High' ? 'danger' : p.migrationComplexity === 'Medium' ? 'warning' : 'success'}>
                        {p.migrationComplexity}
                      </Badge>
                    </td>
                    <td className="p-3 text-right">
                      <Button variant="outline" size="sm" onClick={() => setActiveProduct(p)}>
                        <span>Details</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        /* Alternate Grid Cards View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProducts.map((p) => (
            <Card key={p.ID} className="flex flex-col justify-between hover:border-slate-600 transition">
              <CardHeader className="pb-3">
                <div>
                  <div className="flex items-center justify-between">
                    <Badge variant="cyan">{p.category}</Badge>
                    <Badge variant={p.migrationComplexity === 'High' ? 'danger' : 'warning'}>
                      {p.migrationComplexity}
                    </Badge>
                  </div>
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
      )}

      {/* Product Detail Modal */}
      <Modal
        isOpen={Boolean(activeProduct)}
        onClose={() => setActiveProduct(null)}
        title={activeProduct ? activeProduct.name : 'Product Specifications'}
        subtitle={activeProduct ? `${activeProduct.vendor} • ${activeProduct.category} (${activeProduct.businessFunction})` : ''}
        maxWidth="max-w-2xl"
      >
        {activeProduct && (
          <div className="space-y-4 text-xs">
            {/* Description */}
            <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 text-slate-300 leading-relaxed">
              {activeProduct.description}
            </div>

            {/* Core Dimensions */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-700/40">
                <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                  <DollarSign className="w-3.5 h-3.5 text-amber-400" />
                  <span className="font-semibold text-[11px]">Pricing Model</span>
                </div>
                <div className="font-bold text-white text-sm">{activeProduct.pricingModel}</div>
                <div className="text-[10px] text-amber-400 mt-0.5">Cost Fit: {activeProduct.costScore}/100</div>
              </div>

              <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-700/40">
                <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                  <Shield className="w-3.5 h-3.5 text-blue-400" />
                  <span className="font-semibold text-[11px]">Security Tier</span>
                </div>
                <div className="font-bold text-white text-sm">{activeProduct.securityRating}</div>
                <div className="text-[10px] text-blue-400 mt-0.5">Security Score: {activeProduct.securityScore}/100</div>
              </div>

              <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-700/40">
                <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                  <Server className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="font-semibold text-[11px]">Scalability Tier</span>
                </div>
                <div className="font-bold text-white text-sm">{activeProduct.scalabilityRating}</div>
                <div className="text-[10px] text-cyan-400 mt-0.5">Scale Score: {activeProduct.scalabilityScore}/100</div>
              </div>

              <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-700/40">
                <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                  <Layers className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="font-semibold text-[11px]">Integration</span>
                </div>
                <div className="font-bold text-white text-sm">{activeProduct.integrationCapability}</div>
                <div className="text-[10px] text-emerald-400 mt-0.5">API Score: {activeProduct.integrationScore}/100</div>
              </div>

              <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-700/40">
                <span className="text-slate-400 block font-semibold text-[11px] mb-1">Migration Complexity</span>
                <Badge variant={activeProduct.migrationComplexity === 'High' ? 'danger' : activeProduct.migrationComplexity === 'Medium' ? 'warning' : 'success'}>
                  {activeProduct.migrationComplexity} Complexity
                </Badge>
              </div>

              <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-700/40">
                <span className="text-slate-400 block font-semibold text-[11px] mb-1">Deployment Type</span>
                <div className="font-semibold text-white">{activeProduct.deploymentType}</div>
              </div>
            </div>

            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between text-slate-400 text-[11px]">
              <span>Target Organization: <strong className="text-white">{activeProduct.targetOrganisation}</strong></span>
              <span>REST/GraphQL API: <strong className="text-emerald-400">{activeProduct.apiAvailable ? 'Yes (Native)' : 'No'}</strong></span>
              <span>Features Score: <strong className="text-purple-400">{activeProduct.featuresScore}/100</strong></span>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="outline" size="sm" onClick={() => setActiveProduct(null)}>
                Close Specifications
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal: Admin Add SaaS Product */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add SaaS Product to Catalog"
        subtitle="Catalog Administrator Operation (Role: Admin)"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleAddProduct} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-medium text-slate-300 mb-1">Product Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Workday Adaptive Planning"
                value={newProd.name}
                onChange={(e) => setNewProd({ ...newProd, name: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-300 mb-1">Vendor *</label>
              <input
                type="text"
                required
                placeholder="e.g. Workday"
                value={newProd.vendor}
                onChange={(e) => setNewProd({ ...newProd, vendor: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-300 mb-1">Category *</label>
              <select
                value={newProd.category}
                onChange={(e) => setNewProd({ ...newProd, category: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500"
              >
                {categories.filter(c => c !== 'All').map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-medium text-slate-300 mb-1">Pricing Model</label>
              <input
                type="text"
                value={newProd.pricingModel}
                onChange={(e) => setNewProd({ ...newProd, pricingModel: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-300 mb-1">Cost Score (0-100)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={newProd.costScore}
                onChange={(e) => setNewProd({ ...newProd, costScore: Number(e.target.value) })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-300 mb-1">Security Score (0-100)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={newProd.securityScore}
                onChange={(e) => setNewProd({ ...newProd, securityScore: Number(e.target.value) })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-300 mb-1">Scalability Score (0-100)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={newProd.scalabilityScore}
                onChange={(e) => setNewProd({ ...newProd, scalabilityScore: Number(e.target.value) })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-300 mb-1">Integration Score (0-100)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={newProd.integrationScore}
                onChange={(e) => setNewProd({ ...newProd, integrationScore: Number(e.target.value) })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-300 mb-1">Features Score (0-100)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={newProd.featuresScore}
                onChange={(e) => setNewProd({ ...newProd, featuresScore: Number(e.target.value) })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-300 mb-1">Migration Complexity</label>
              <select
                value={newProd.migrationComplexity}
                onChange={(e) => setNewProd({ ...newProd, migrationComplexity: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block font-medium text-slate-300 mb-1">Platform Description</label>
              <textarea
                rows={2}
                value={newProd.description}
                onChange={(e) => setNewProd({ ...newProd, description: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
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
