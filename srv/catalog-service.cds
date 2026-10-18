using { saas.transformation as my } from '../db/schema';

service CatalogService @(path: '/odata/v4/catalog') {
  @readonly entity SaaSProducts as projection on my.SaaSProducts;
  @readonly entity ProductCapabilities as projection on my.ProductCapabilities;

  // Actions for Admin maintenance
  action addProduct(product: SaaSProducts) returns SaaSProducts;
  action updateProduct(id: String, product: SaaSProducts) returns SaaSProducts;
  action retireProduct(id: String) returns SaaSProducts;
}
