import { describe, it, expect } from 'vitest';
import { catalogService } from '../services/catalogService';

describe('SaaS Catalog Service & Filtering', () => {
  it('loads exactly 10 seeded SaaS products from repository seed', async () => {
    const products = await catalogService.getProducts();
    expect(products.length).toBe(10);
    products.forEach((p) => {
      expect(p.ID).toBeDefined();
      expect(p.name).toBeDefined();
      expect(p.vendor).toBeDefined();
      expect(p.category).toBeDefined();
      expect(p.costScore).toBeGreaterThan(0);
      expect(p.securityScore).toBeGreaterThan(0);
      expect(p.scalabilityScore).toBeGreaterThan(0);
      expect(p.integrationScore).toBeGreaterThan(0);
      expect(p.status).toBe('Active');
    });
  });

  it('filters catalog products by category correctly', async () => {
    const all = await catalogService.getProducts();

    const erp = all.filter(p => p.category === 'ERP');
    expect(erp.length).toBe(2);
    const erpNames = erp.map(p => p.name);
    expect(erpNames).toContain('SAP S/4HANA Cloud');
    expect(erpNames).toContain('Oracle Fusion Cloud ERP');

    const crm = all.filter(p => p.category === 'CRM');
    expect(crm.length).toBe(2);
    const crmNames = crm.map(p => p.name);
    expect(crmNames).toContain('Salesforce Sales Cloud');
    expect(crmNames).toContain('Microsoft Dynamics 365');

    const hcm = all.filter(p => p.category === 'HCM');
    expect(hcm.length).toBe(1);
    expect(hcm[0].name).toBe('Workday HCM');

    const itsm = all.filter(p => p.category === 'ITSM');
    expect(itsm.length).toBe(1);
    expect(itsm[0].name).toBe('ServiceNow IT Service Management');

    const productivity = all.filter(p => p.category === 'Productivity');
    expect(productivity.length).toBe(2);

    const analytics = all.filter(p => p.category === 'Analytics');
    expect(analytics.length).toBe(1);

    const identity = all.filter(p => p.category === 'Identity');
    expect(identity.length).toBe(1);
  });

  it('searches products by name, vendor, or capabilities case-insensitively', async () => {
    const all = await catalogService.getProducts();

    const searchCatalog = (query) => {
      const q = query.toLowerCase().trim();
      return all.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.vendor.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.businessFunction && p.businessFunction.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q))
      );
    };

    expect(searchCatalog('Salesforce').length).toBe(1);
    expect(searchCatalog('salesforce')[0].name).toBe('Salesforce Sales Cloud');

    expect(searchCatalog('SAP').length).toBe(1);
    expect(searchCatalog('SAP')[0].vendor).toBe('SAP');

    expect(searchCatalog('cloud').length).toBeGreaterThanOrEqual(4);

    expect(searchCatalog('NonExistentVendorXYZ').length).toBe(0);
  });

  it('retrieves full product specifications for modal detail inspection', async () => {
    const product = await catalogService.getProductById('salesforce-crm');
    expect(product).not.toBeNull();
    expect(product.name).toBe('Salesforce Sales Cloud');
    expect(product.vendor).toBe('Salesforce');
    expect(product.pricingModel).toBe('Per User/Month');
    expect(product.securityRating).toContain('SOC2');
    expect(product.deploymentType).toBe('Multi-tenant Public Cloud');
    expect(product.migrationComplexity).toBe('Medium');
  });

  it('allows catalog admin to add a new product', async () => {
    const newProduct = {
      name: 'Databricks Lakehouse Platform',
      vendor: 'Databricks',
      category: 'Analytics',
      pricingModel: 'Consumption/Compute Units',
      costScore: 80,
      securityScore: 92,
      scalabilityScore: 95,
      integrationScore: 88,
      featuresScore: 94,
      migrationComplexity: 'Medium',
      description: 'Unified data intelligence and warehouse platform.'
    };

    const added = await catalogService.addProduct(newProduct);
    expect(added.ID).toBeDefined();
    expect(added.name).toBe('Databricks Lakehouse Platform');

    const all = await catalogService.getProducts();
    expect(all.some(p => p.name === 'Databricks Lakehouse Platform')).toBe(true);
  });
});
