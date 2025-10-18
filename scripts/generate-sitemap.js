#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { create } = require('xmlbuilder2');
const glob = require('glob');

// Update this to your production domain
const SITE_URL = process.env.SITE_URL || 'https://venusco.in';

const files = glob.sync('*.html');
const urlset = {
  urlset: {
    '@xmlns': 'http://www.sitemaps.org/schemas/sitemap/0.9',
    url: files.map(f => {
      const loc = `${SITE_URL}/${f === 'index.html' ? '' : f}`;
      return {
        loc,
        changefreq: f === 'index.html' ? 'weekly' : 'monthly',
        priority: f === 'index.html' ? '1.0' : '0.8'
      };
    })
  }
};

const xml = create(urlset).end({ prettyPrint: true });
fs.writeFileSync(path.join(__dirname, '..', 'sitemap.xml'), xml, 'utf8');
console.log('sitemap.xml generated with', files.length, 'entries');
