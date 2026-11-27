import { supabase, shouldUseMocks } from '../lib/supabase';
import initialProducts from '../data/products.json';

const PRODUCTS_KEY = 'saas_catalog_products_data';

function getStoredProducts() {
  if (typeof window === 'undefined') return initialProducts;
  const saved = localStorage.getItem(PRODUCTS_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch {
      // fallback
    }
  }
  return initialProducts;
}

function saveStoredProducts(products) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
  }
}

function mapProductFromPostgres(row) {
  if (!row) return null;
  return {
    ID: row.id,
    id: row.id,
    name: row.name,
    vendor: row.vendor,
    category: row.category,
    businessFunction: row.business_function,
    pricingModel: row.pricing_model,
    costLevel: row.cost_level,
    costScore: Number(row.cost_score) || 0,
    scalabilityRating: row.scalability_rating,
    scalabilityScore: Number(row.scalability_score) || 0,
    securityRating: row.security_rating,
    securityScore: Number(row.security_score) || 0,
    integrationCapability: row.integration_capability,
    integrationScore: Number(row.integration_score) || 0,
    featuresScore: Number(row.features_score) || 0,
    deploymentType: row.deployment_type,
    targetOrganisation: row.target_organisation,
    migrationComplexity: row.migration_complexity,
    apiAvailable: row.api_available !== false,
    status: row.status || 'Active',
    description: row.description
  };
}

export const catalogService = {
  async getProducts() {
    if (!shouldUseMocks()) {
      try {
        const { data, error } = await supabase
          .from('saas_products')
          .select('*')
          .eq('status', 'Active')
          .order('name');

        if (!error && data && data.length > 0) {
          return data.map(mapProductFromPostgres);
        }
      } catch {
        // Fallback to local
      }
    }

    return getStoredProducts().filter(p => p.status === 'Active');
  },

  async getAllProducts() {
    if (!shouldUseMocks()) {
      try {
        const { data, error } = await supabase
          .from('saas_products')
          .select('*')
          .order('name');

        if (!error && data && data.length > 0) {
          return data.map(mapProductFromPostgres);
        }
      } catch {
        // Fallback to local
      }
    }

    return getStoredProducts();
  },

  async getProductById(id) {
    if (!shouldUseMocks()) {
      try {
        const { data, error } = await supabase
          .from('saas_products').select('*').eq('id', id).maybeSingle();

        if (!error && data) {
          return mapProductFromPostgres(data);
        }
      } catch {
        // Fallback to local
      }
    }

    return getStoredProducts().find(p => p.ID === id || p.id === id) || null;
  },

  async addProduct(product) {
    const id = product.ID || product.id || (product.name || 'product').toLowerCase().replace(/[^a-z0-9]/g, '-');
    const newProduct = {
      ...product,
      ID: id,
      id: id,
      status: product.status || 'Active',
      costScore: Number(product.costScore) || 75.0,
      securityScore: Number(product.securityScore) || 85.0,
      scalabilityScore: Number(product.scalabilityScore) || 85.0,
      integrationScore: Number(product.integrationScore) || 80.0,
      featuresScore: Number(product.featuresScore) || 85.0
    };

    if (!shouldUseMocks()) {
      try {
        const { data, error } = await supabase
          .from('saas_products')
          .insert({
            id: newProduct.id,
            name: newProduct.name,
            vendor: newProduct.vendor,
            category: newProduct.category,
            business_function: newProduct.businessFunction,
            pricing_model: newProduct.pricingModel,
            cost_level: newProduct.costLevel,
            cost_score: newProduct.costScore,
            scalability_rating: newProduct.scalabilityRating,
            scalability_score: newProduct.scalabilityScore,
            security_rating: newProduct.securityRating,
            security_score: newProduct.securityScore,
            integration_capability: newProduct.integrationCapability,
            integration_score: newProduct.integrationScore,
            features_score: newProduct.featuresScore,
            deployment_type: newProduct.deploymentType,
            target_organisation: newProduct.targetOrganisation,
            migration_complexity: newProduct.migrationComplexity,
            api_available: newProduct.apiAvailable,
            status: newProduct.status,
            description: newProduct.description
          })
          .select()
          .single();

        if (!error && data) {
          const mapped = mapProductFromPostgres(data);
          const current = getStoredProducts();
          saveStoredProducts([mapped, ...current.filter(p => (p.ID || p.id) !== mapped.id)]);
          return mapped;
        }
      } catch {
        // Fallback to local
      }
    }

    const current = getStoredProducts();
    const updated = [newProduct, ...current.filter(p => (p.ID || p.id) !== newProduct.id)];
    saveStoredProducts(updated);
    return newProduct;
  },

  async updateProduct(id, updates) {
    if (!shouldUseMocks()) {
      try {
        const payload = {};
        if (updates.name !== undefined) payload.name = updates.name;
        if (updates.vendor !== undefined) payload.vendor = updates.vendor;
        if (updates.category !== undefined) payload.category = updates.category;
        if (updates.status !== undefined) payload.status = updates.status;
        if (updates.costScore !== undefined) payload.cost_score = Number(updates.costScore);
        if (updates.securityScore !== undefined) payload.security_score = Number(updates.securityScore);

        const { data, error } = await supabase
          .from('saas_products')
          .update(payload)
          .eq('id', id)
          .select()
          .single();

        if (!error && data) {
          const mapped = mapProductFromPostgres(data);
          const current = getStoredProducts();
          const idx = current.findIndex(p => p.ID === id || p.id === id);
          if (idx !== -1) {
            current[idx] = mapped;
            saveStoredProducts(current);
          }
          return mapped;
        }
      } catch {
        // Fallback to local
      }
    }

    const products = getStoredProducts();
    const idx = products.findIndex(p => p.ID === id || p.id === id);
    if (idx === -1) throw new Error(`Product ${id} not found`);
    products[idx] = { ...products[idx], ...updates };
    saveStoredProducts(products);
    return products[idx];
  },

  async retireProduct(id) {
    return this.updateProduct(id, { status: 'Retired' });
  }
};
