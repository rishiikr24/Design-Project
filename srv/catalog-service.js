const cds = require('@sap/cds');

module.exports = cds.service.impl(async function() {
  const { SaaSProducts } = this.entities;

  this.on('addProduct', async (req) => {
    const { product } = req.data;
    if (!product || !product.name) return req.error(400, 'Product name is required');
    if (!product.id) {
      product.id = product.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    }
    product.status = 'Active';
    await INSERT.into(SaaSProducts).entries(product);
    return product;
  });

  this.on('updateProduct', async (req) => {
    const { id, product } = req.data;
    await UPDATE(SaaSProducts).set(product).where({ id });
    return SELECT.one.from(SaaSProducts).where({ id });
  });

  this.on('retireProduct', async (req) => {
    const { id } = req.data;
    await UPDATE(SaaSProducts).set({ status: 'Retired' }).where({ id });
    return SELECT.one.from(SaaSProducts).where({ id });
  });
});
