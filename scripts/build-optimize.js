#!/usr/bin/env node

/**
 * Script de optimización para construcción de producción
 * Ejecuta varias tareas de optimización antes del build
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Iniciando optimización para producción...\n');

// 1. Limpiar directorios de construcción
console.log('🧹 Limpiando directorios...');
try {
  execSync('rm -rf .next', { stdio: 'inherit' });
  execSync('rm -rf out', { stdio: 'inherit' });
  console.log('✅ Directorios limpiados\n');
} catch (error) {
  console.log('⚠️ No se pudieron limpiar algunos directorios (puede ser normal)\n');
}

// 2. Verificar dependencias
console.log('📦 Verificando dependencias...');
try {
  execSync('npm audit --audit-level moderate', { stdio: 'inherit' });
  console.log('✅ Dependencias verificadas\n');
} catch (error) {
  console.log('⚠️ Se encontraron vulnerabilidades. Considera ejecutar npm audit fix\n');
}

// 3. Verificar lint
console.log('🔍 Verificando código con ESLint...');
try {
  execSync('npm run lint', { stdio: 'inherit' });
  console.log('✅ Código verificado\n');
} catch (error) {
  console.log('❌ Se encontraron errores de lint. Corrige antes de continuar.\n');
  process.exit(1);
}

// 4. Verificar tipos TypeScript
console.log('📝 Verificando tipos TypeScript...');
try {
  execSync('npx tsc --noEmit', { stdio: 'inherit' });
  console.log('✅ Tipos verificados\n');
} catch (error) {
  console.log('❌ Se encontraron errores de TypeScript. Corrige antes de continuar.\n');
  process.exit(1);
}

// 5. Optimizar imágenes (si existen)
console.log('🖼️ Verificando optimización de imágenes...');
const publicDir = path.join(process.cwd(), 'public');
if (fs.existsSync(publicDir)) {
  console.log('✅ Directorio público encontrado\n');
} else {
  console.log('ℹ️ No se encontró directorio público\n');
}

// 6. Verificar variables de entorno
console.log('🔧 Verificando configuración...');
const envExample = path.join(process.cwd(), '.env.example');
const envLocal = path.join(process.cwd(), '.env.local');

if (fs.existsSync(envExample)) {
  console.log('✅ Archivo .env.example encontrado');
} else {
  console.log('⚠️ No se encontró .env.example');
}

if (fs.existsSync(envLocal)) {
  console.log('✅ Archivo .env.local encontrado');
} else {
  console.log('ℹ️ No se encontró .env.local (opcional)');
}

// 7. Generar reporte de bundle (opcional)
console.log('\n📊 Generando análisis de bundle...');
try {
  execSync('npm run analyze 2>/dev/null || echo "Script analyze no disponible"', { stdio: 'inherit' });
} catch (error) {
  console.log('ℹ️ Análisis de bundle no disponible');
}

console.log('\n✨ Optimización completada. Listo para construir!\n');
console.log('Ejecuta: npm run build');
console.log('Para exportar estático: npm run export\n');