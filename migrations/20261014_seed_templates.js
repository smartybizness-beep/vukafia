exports.up = async function(knex) {
  const templates = [
    // Nigeria Templates
    {
      name: 'Commercial Invoice - Nigeria',
      description: 'Standard commercial invoice template for Nigerian exporters',
      category: 'invoicing',
      file_url: 'https://example.com/templates/invoice-ng.pdf',
      country_code: 'NG',
      country_name: 'Nigeria',
      trade_route: 'NG-KE',
      instructions: 'Fill in your business details, buyer information, and itemized list of goods',
      is_free: true,
      access_days: 7,
      template_type: 'invoice',
      active: true,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now()
    },
    {
      name: 'Packing List - Nigeria to Kenya',
      description: 'Detailed packing list for goods shipment from Nigeria to Kenya',
      category: 'shipping',
      file_url: 'https://example.com/templates/packing-list-ng-ke.pdf',
      country_code: 'NG',
      country_name: 'Nigeria',
      trade_route: 'NG-KE',
      instructions: 'Document each carton/box with contents, weight, and dimensions',
      is_free: true,
      access_days: 7,
      template_type: 'packing',
      active: true,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now()
    },
    {
      name: 'Bill of Lading Template - Nigeria',
      description: 'Bill of Lading for sea freight from Nigerian ports',
      category: 'shipping',
      file_url: 'https://example.com/templates/bol-ng.pdf',
      country_code: 'NG',
      country_name: 'Nigeria',
      trade_route: 'NG-GH',
      instructions: 'Shipper, consignee, and vessel information required',
      is_free: true,
      access_days: 7,
      template_type: 'packing',
      active: true,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now()
    },
    // Kenya Templates
    {
      name: 'Commercial Invoice - Kenya',
      description: 'Standard commercial invoice template for Kenyan exporters',
      category: 'invoicing',
      file_url: 'https://example.com/templates/invoice-ke.pdf',
      country_code: 'KE',
      country_name: 'Kenya',
      trade_route: 'KE-NG',
      instructions: 'Fill in your business details, buyer information, and itemized list of goods',
      is_free: true,
      access_days: 7,
      template_type: 'invoice',
      active: true,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now()
    },
    {
      name: 'Customs Declaration Form - Kenya',
      description: 'Kenya Revenue Authority (KRA) customs declaration form',
      category: 'compliance',
      file_url: 'https://example.com/templates/kra-customs-form.pdf',
      country_code: 'KE',
      country_name: 'Kenya',
      trade_route: 'KE-NG',
      instructions: 'Complete with HS codes, product descriptions, and value declarations',
      is_free: true,
      access_days: 7,
      template_type: 'customs',
      active: true,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now()
    },
    // Ghana Templates
    {
      name: 'Invoice Template - Ghana',
      description: 'Standard invoice for Ghanaian businesses',
      category: 'invoicing',
      file_url: 'https://example.com/templates/invoice-gh.pdf',
      country_code: 'GH',
      country_name: 'Ghana',
      trade_route: 'GH-NG',
      instructions: 'Complete with VAT registration number and recipient details',
      is_free: true,
      access_days: 7,
      template_type: 'invoice',
      active: true,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now()
    },
    {
      name: 'Export Permit Application - Ghana',
      description: 'Ghana Export Promotion Authority (GEPA) export permit',
      category: 'compliance',
      file_url: 'https://example.com/templates/gepa-export-permit.pdf',
      country_code: 'GH',
      country_name: 'Ghana',
      trade_route: 'GH-KE',
      instructions: 'Submit with business registration and product specifications',
      is_free: true,
      access_days: 7,
      template_type: 'permit',
      active: true,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now()
    },
    // Benin Templates
    {
      name: 'Commercial Invoice - Benin',
      description: 'Invoice template for Beninese exporters',
      category: 'invoicing',
      file_url: 'https://example.com/templates/invoice-bj.pdf',
      country_code: 'BJ',
      country_name: 'Benin',
      trade_route: 'BJ-NG',
      instructions: 'Include RCCM number and tax identification',
      is_free: true,
      access_days: 7,
      template_type: 'invoice',
      active: true,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now()
    }
  ];

  // Insert only if not already present
  const existing = await knex('templates').count('* as count').first();
  if (existing.count === 0) {
    await knex('templates').insert(templates);
  }
};

exports.down = async function(knex) {
  // Optionally delete seed data on rollback
  // await knex('templates').whereIn('name', templates.map(t => t.name)).delete();
};
