import initialProducts from '../data/products.json';

let productsState = [...initialProducts];

export const catalogService = {
  async getProducts() {
    return productsState.filter(p => p.status === 'Active');
  },

  async getAllProducts() {
    return productsState;
  },

  async getProductById(id) {
    return productsState.find(p => p.ID === id) || null;
  },

  async addProduct(product) {
    const id = product.ID || (product.name || 'product').toLowerCase().replace(/[^a-z0-9]/g, '-');
    const newProduct = {
      ...product,
      ID: id,
      status: product.status || 'Active',
      costScore: Number(product.costScore) || 75.0,
      securityScore: Number(product.securityScore) || 85.0,
      scalabilityScore: Number(product.scalabilityScore) || 85.0,
      integrationScore: Number(product.integrationScore) || 80.0,
      featuresScore: Number(product.featuresScore) || 85.0
    };
    productsState = [newProduct, ...productsState];
    return newProduct;
  },

  async updateProduct(id, updates) {
    const idx = productsState.findIndex(p => p.ID === id);
    if (idx === -1) throw new Error(`Product ${id} not found`);
    productsState[idx] = { ...productsState[idx], ...updates };
    return productsState[idx];
  },

  async retireProduct(id) {
    return this.updateProduct(id, { status: 'Retired' });
  }
};

