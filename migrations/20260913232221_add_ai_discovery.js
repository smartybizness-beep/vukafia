/**
 * AI discovery — log of natural-language searches: what was asked, how it was
 * interpreted (structured filters), and how many listings came back.
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  await knex.schema.createTable('search_queries', t => {
    t.increments('id').primary();
    t.enu('source', ['web', 'whatsapp']).notNullable();
    t.text('query').notNullable();               // raw text as typed by the user
    t.string('client_ref', 32);                  // hashed IP / phone number, never raw
    t.string('language', 8);                     // en, fr, ar, sw, ha, pidgin
    t.json('filters');                           // parsed intent: type/category/country/...
    t.boolean('used_ai').notNullable().defaultTo(false); // false = keyword fallback
    t.string('model');
    t.integer('input_tokens');
    t.integer('output_tokens');
    t.integer('latency_ms');
    t.integer('result_count').notNullable().defaultTo(0);
    t.string('relaxed');                         // 'keywords' when exact keywords were dropped to find results
    t.timestamp('created_at').defaultTo(knex.fn.now());
    t.index('created_at');
    t.index('used_ai');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists('search_queries');
};
