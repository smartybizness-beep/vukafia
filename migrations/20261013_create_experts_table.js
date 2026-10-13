/**
 * Migration: Create experts table for trade compliance directory
 * Customs brokers, lawyers, compliance consultants by country
 */

exports.up = async function(knex) {
  return knex.schema.createTable('experts', t => {
    t.increments('id').primary();
    t.string('name').notNullable();
    t.string('title').notNullable();  // "Customs Broker", "Trade Lawyer", "Compliance Consultant"
    t.string('expertise').notNullable();  // "customs_clearance", "legal_documentation", "compliance"
    t.string('country_code').notNullable();  // NG, KE, GH, BJ
    t.string('country_name');
    t.string('city');
    t.text('bio');
    t.string('phone');
    t.string('email');
    t.string('website');
    t.string('company_name');
    t.json('trade_routes_served');  // ["Nigeria-Kenya", "Kenya-Ghana"]
    t.integer('years_experience').defaultTo(0);
    t.decimal('rating', 3, 1).defaultTo(0.0);  // 1-5 stars
    t.integer('review_count').defaultTo(0);
    t.boolean('verified').defaultTo(false);
    t.string('status', 30).defaultTo('pending_verification');  // active | inactive | pending_verification
    t.timestamps(true, true);
  });
};

exports.down = async function(knex) {
  return knex.schema.dropTable('experts');
};
