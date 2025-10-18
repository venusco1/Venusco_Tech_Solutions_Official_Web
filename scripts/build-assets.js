#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const glob = require('glob');
const { minify } = require('terser');
const csso = require('csso');

const outDir = path.join(__dirname, '..', 'dist');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

async function generateResponsiveImages() {
  const sizes = [400, 800, 1200];
  const images = glob.sync('assets/img/**/*.{png,jpg,jpeg,webp}');
  for (const imgPath of images) {
    const rel = path.relative(process.cwd(), imgPath);
    const parsed = path.parse(rel);
    const targetDir = path.join(outDir, parsed.dir);
    if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });
    for (const width of sizes) {
      const outFile = path.join(targetDir, `${parsed.name}-${width}.webp`);
      try {
        await sharp(imgPath).resize({ width }).webp({ quality: 80 }).toFile(outFile);
        console.log('wrote', outFile);
      } catch (err) {
        console.error('error processing', imgPath, err.message);
      }
    }
  }
}

async function minifyAssets() {
  // Minify JS
  const jsFiles = glob.sync('assets/js/**/*.js');
  for (const f of jsFiles) {
    const code = fs.readFileSync(f, 'utf8');
    try {
      const result = await minify(code, { sourceMap: false });
      const outPath = path.join(outDir, f);
      const outDirPath = path.dirname(outPath);
      if (!fs.existsSync(outDirPath)) fs.mkdirSync(outDirPath, { recursive: true });
      fs.writeFileSync(outPath, result.code, 'utf8');
      console.log('minified js', f, '->', outPath);
    } catch (err) {
      console.error('terser error', f, err.message);
    }
  }

  // Minify CSS
  const cssFiles = glob.sync('assets/css/**/*.css');
  for (const f of cssFiles) {
    const css = fs.readFileSync(f, 'utf8');
    try {
      const result = csso.minify(css).css;
      const outPath = path.join(outDir, f);
      const outDirPath = path.dirname(outPath);
      if (!fs.existsSync(outDirPath)) fs.mkdirSync(outDirPath, { recursive: true });
      fs.writeFileSync(outPath, result, 'utf8');
      console.log('minified css', f, '->', outPath);
    } catch (err) {
      console.error('csso error', f, err.message);
    }
  }
}

function copyDistToAssets() {
  // copy dist/assets/* -> assets/* (overwrite) so HTML can reference original paths
  const files = glob.sync('dist/assets/**', { nodir: true });
  for (const f of files) {
    const rel = path.relative(path.join(process.cwd(), 'dist'), f);
    const dest = path.join(process.cwd(), rel);
    const destDir = path.dirname(dest);
    if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
    fs.copyFileSync(f, dest);
    console.log('copied', f, '->', dest);
  }
}

function injectGAId() {
  const gtmId = process.env.GTM_ID || process.env.GTM_CONTAINER_ID || '';
  const gaId = process.env.GA_ID || process.env.GA_MEASUREMENT_ID || '';
  const indexPath = path.join(process.cwd(), 'index.html');
  if (!fs.existsSync(indexPath)) return;
  let html = fs.readFileSync(indexPath, 'utf8');

  if (gtmId) {
    html = html.replace(/GTM-XXXXXXX/g, gtmId);
    console.log('Injected GTM ID into index.html');
  } else if (gaId) {
    html = html.replace(/G-XXXXXXXXXX/g, gaId);
    console.log('Injected GA ID into index.html');
  }

  fs.writeFileSync(indexPath, html, 'utf8');
}

(async function() {
  console.log('Generating responsive images...');
  await generateResponsiveImages();
  console.log('Minifying assets...');
  await minifyAssets();
  console.log('Copying optimized assets into assets/');
  copyDistToAssets();

  console.log('Injecting GA ID if provided via env (GA_ID or GA_MEASUREMENT_ID)');
  injectGAId();
  console.log('Build completed. Dist folder contains optimized assets.');
})();
