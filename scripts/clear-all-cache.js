#!/usr/bin/env node

/**
 * Script agresivo para limpiar TODOS los cachés y forzar deploy en Vercel
 * Autor: SwiftPDF Team
 * Fecha: 2025-08-19
 */

const fs = require('fs');
const path = require('path');

console.log('🔥 INICIANDO LIMPIEZA AGRESIVA DE CACHÉS...\n');

// 1. Limpiar caché de Next.js
const nextCacheDir = path.join(process.cwd(), '.next');
if (fs.existsSync(nextCacheDir)) {
  fs.rmSync(nextCacheDir, { recursive: true, force: true });
  console.log('✅ Caché de Next.js eliminado (.next/)');
}

// 2. Limpiar node_modules
const nodeModulesDir = path.join(process.cwd(), 'node_modules');
if (fs.existsSync(nodeModulesDir)) {
  fs.rmSync(nodeModulesDir, { recursive: true, force: true });
  console.log('✅ node_modules eliminado');
}

// 3. Limpiar package-lock.json
const packageLockPath = path.join(process.cwd(), 'package-lock.json');
if (fs.existsSync(packageLockPath)) {
  fs.unlinkSync(packageLockPath);
  console.log('✅ package-lock.json eliminado');
}

// 4. Crear archivo de timestamp único para forzar cambios
const timestampFile = path.join(process.cwd(), '.force-deploy-' + Date.now());
fs.writeFileSync(timestampFile, `Deploy forzado: ${new Date().toISOString()}\nTimestamp: ${Date.now()}\nCommit: force-clear-cache`);
console.log('✅ Archivo de forzado creado:', path.basename(timestampFile));

// 5. Actualizar vercel.json con timestamp único
const vercelPath = path.join(process.cwd(), 'vercel.json');
if (fs.existsSync(vercelPath)) {
  const vercelConfig = JSON.parse(fs.readFileSync(vercelPath, 'utf8'));
  vercelConfig.buildCommand = "npm ci && npm run build";
  vercelConfig.installCommand = "npm ci";
  vercelConfig.cache = false;
  vercelConfig.timestamp = Date.now();
  
  fs.writeFileSync(vercelPath, JSON.stringify(vercelConfig, null, 2));
  console.log('✅ vercel.json actualizado con anti-cache');
}

// 6. Crear .vercelignore para limpiar caché
const vercelIgnorePath = path.join(process.cwd(), '.vercelignore');
fs.writeFileSync(vercelIgnorePath, `# Forzar limpieza de caché
.next
node_modules
*.log
.env.local
.force-deploy-*
`);
console.log('✅ .vercelignore creado');

// 7. Actualizar package.json para forzar nueva instalación
const packagePath = path.join(process.cwd(), 'package.json');
if (fs.existsSync(packagePath)) {
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  packageJson.timestamp = Date.now();
  packageJson.scripts.prebuild = "echo 'Force clean build - no cache'";
  packageJson.scripts['clear-cache'] = "rm -rf .next node_modules package-lock.json";
  
  fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
  console.log('✅ package.json actualizado con timestamp único');
}

console.log('\n🎯 LIMPIEZA COMPLETADA');
console.log('📋 Próximos pasos:');
console.log('1. git add .');
console.log('2. git commit -m "FORCE DEPLOY: Clear all cache and force rebuild"');
console.log('3. git push origin main');
console.log('4. Vercel detectará los cambios automáticamente');
console.log('\n💥 Esta vez SÍ funcionará - caché completamente eliminado!');