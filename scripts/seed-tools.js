/*
  One-off seeding script for tools_catalog.
  Usage:
    SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... BRANDFETCH_CLIENT_ID=... \
      node scripts/seed-tools.js

  Notes:
  - Requires service role key to bypass RLS for insert/update on tools_catalog
  - Reads CSV at seed/tools_catalog_seed.csv
  - Matches existing rows by domain (case-insensitive) if present, else by lower(name)
*/

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const { parse } = require('csv-parse/sync');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BRANDFETCH_CLIENT_ID = process.env.BRANDFETCH_CLIENT_ID || '';

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

function computeLogoUrl(domain) {
  if (!domain) return null;
  const d = domain.replace(/^https?:\/\//, '').replace(/\/$/, '');
  if (BRANDFETCH_CLIENT_ID) {
    return `https://cdn.brandfetch.io/${d}?c=${BRANDFETCH_CLIENT_ID}`;
  }
  return `https://logo.brandfetch.io/${d}`;
}

function parseArrayField(value) {
  if (!value) return [];
  const trimmed = String(value).trim();
  try {
    if (trimmed.startsWith('[')) return JSON.parse(trimmed);
  } catch {}
  return trimmed.split(',').map(s => s.trim()).filter(Boolean);
}

async function upsertRow(row) {
  const name = (row.name || '').trim();
  const domain = (row.domain || '').trim() || null;
  const category = (row.category || 'Other').trim();
  const description = (row.description || '').trim();
  const aliases = parseArrayField(row.aliases || '');
  const keywords = parseArrayField(row.keywords || '');
  const popularity = Number(row.popularity || 0) || 0;
  const logo_url = (row.logo_url ? String(row.logo_url).trim() : '') || computeLogoUrl(domain);

  // Try to find existing by domain first
  let existing = null;
  if (domain) {
    const { data, error } = await supabase
      .from('tools_catalog')
      .select('id,name,domain')
      .ilike('domain', domain);
    if (error) throw error;
    existing = (data && data[0]) || null;
  }
  if (!existing) {
    const { data, error } = await supabase
      .from('tools_catalog')
      .select('id,name')
      .ilike('name', name);
    if (error) throw error;
    existing = (data && data[0]) || null;
  }

  if (existing) {
    const { error } = await supabase
      .from('tools_catalog')
      .update({ name, domain, category, description, aliases, keywords, popularity, logo_url })
      .eq('id', existing.id);
    if (error) throw error;
    return { action: 'update', id: existing.id, name };
  } else {
    const { data, error } = await supabase
      .from('tools_catalog')
      .insert([{ name, domain, category, description, aliases, keywords, popularity, logo_url }])
      .select('id')
      .single();
    if (error) throw error;
    return { action: 'insert', id: data && data.id, name };
  }
}

async function main() {
  const csvPath = path.resolve('seed/tools_catalog_seed.csv');
  const csv = fs.readFileSync(csvPath, 'utf8');
  const records = parse(csv, { columns: true, skip_empty_lines: true });

  let inserted = 0, updated = 0; let processed = 0;
  for (const r of records) {
    try {
      const res = await upsertRow(r);
      processed++; if (res.action === 'insert') inserted++; else updated++;
      if (processed % 20 === 0) {
        console.log(`Progress: ${inserted} inserted, ${updated} updated...`);
      }
    } catch (e) {
      console.error('Upsert failed for', r.name, e && (e.message || e));
    }
  }
  console.log('Done', { inserted, updated, total: records.length });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
