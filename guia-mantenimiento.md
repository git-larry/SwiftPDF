# Guía de Mantenimiento - SwiftPDF

## 📋 Información General

**Proyecto:** SwiftPDF - Herramientas PDF Online  
**Versión:** 1.0  
**Framework:** Next.js 13.5.1 con TypeScript  
**Fecha de creación:** 13 de Agosto, 2025  

## 🎯 Propósito de esta Guía

Esta guía está diseñada para desarrolladores que necesiten mantener, actualizar o continuar el desarrollo del proyecto SwiftPDF. Contiene toda la información necesaria para trabajar eficientemente con el código base.

## 🚀 Configuración Inicial para Nuevos Desarrolladores

### Prerrequisitos del Sistema
```bash
# Verificar versiones requeridas
node --version    # Debe ser 16.x o superior (recomendado 18.x)
npm --version     # Debe ser 8.x o superior
git --version     # Para control de versiones
```

### Configuración del Entorno
1. **Clonar/Acceder al proyecto:**
   ```bash
   cd "c:\VSC Sites\swift_pdf"
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Verificar configuración:**
   ```bash
   npm run lint
   npm audit
   ```

4. **Iniciar servidor de desarrollo:**
   ```bash
   npm run dev
   ```

## 📁 Estructura del Proyecto

### Archivos Críticos (NO MODIFICAR sin análisis)
- [`package.json`](package.json) - Dependencias y scripts
- [`next.config.js`](next.config.js) - Configuración de Next.js
- [`tailwind.config.ts`](tailwind.config.ts) - Configuración de estilos
- [`tsconfig.json`](tsconfig.json) - Configuración de TypeScript

### Directorios Principales
```
swift_pdf/
├── 📁 app/                    # App Router (Next.js 13+)
├── 📁 components/             # Componentes React
├── 📁 data/                   # Datos estáticos (tools.json)
├── 📁 public/locales/         # Traducciones i18n
├── 📁 utils/                  # Utilidades de procesamiento
└── 📁 docs/                   # Documentación del proyecto
```

### Componentes Clave
- **[`Layout.tsx`](components/Layout.tsx)** - Layout principal
- **[`ToolCard.tsx`](components/ToolCard.tsx)** - Tarjetas de herramientas
- **[`FileUpload.tsx`](components/FileUpload.tsx)** - Carga de archivos
- **[`pdfProcessing.ts`](utils/pdfProcessing.ts)** - Lógica PDF

## 🔧 Tareas de Mantenimiento Rutinario

### Diario (Durante desarrollo activo)
- [ ] Ejecutar `npm run lint` antes de commits
- [ ] Verificar que `npm run dev` inicie sin errores
- [ ] Probar funcionalidades modificadas

### Semanal
- [ ] Ejecutar `npm audit` para vulnerabilidades
- [ ] Revisar logs de errores en consola
- [ ] Verificar rendimiento de carga

### Mensual
- [ ] Actualizar dependencias de seguridad
- [ ] Revisar `npm outdated`
- [ ] Backup del proyecto
- [ ] Revisar métricas de rendimiento

### Trimestral
- [ ] Actualizar dependencias menores
- [ ] Revisar nuevas versiones de Next.js
- [ ] Optimizar bundle size
- [ ] Auditoría de código

## 📦 Gestión de Dependencias

### Comandos Esenciales
```bash
# Ver dependencias desactualizadas
npm outdated

# Auditoría de seguridad
npm audit
npm audit fix

# Actualizar dependencia específica
npm install package@latest

# Limpiar caché
npm cache clean --force

# Reinstalación completa
rm -rf node_modules package-lock.json
npm install
```

### Dependencias Críticas (Actualizar con precaución)
- **Next.js** - Cambios en App Router pueden afectar routing
- **React** - Cambios en hooks pueden requerir refactoring
- **Radix UI** - Cambios en API pueden afectar componentes
- **pdf-lib** - Cambios pueden afectar procesamiento PDF

### Dependencias Seguras de Actualizar
- **Utilidades:** date-fns, clsx, tailwind-merge
- **Iconos:** @heroicons/react, lucide-react
- **Tipos:** @types/node, @types/react

## 🛠️ Comandos de Desarrollo

### Desarrollo Local
```bash
# Iniciar servidor de desarrollo
npm run dev

# Iniciar en puerto específico
npm run dev -- -p 3001

# Modo de desarrollo con debug
NODE_OPTIONS='--inspect' npm run dev
```

### Build y Producción
```bash
# Construir para producción
npm run build

# Iniciar servidor de producción
npm start

# Analizar bundle
npm run build && npx @next/bundle-analyzer
```

### Linting y Calidad
```bash
# Ejecutar ESLint
npm run lint

# Corregir problemas automáticamente
npm run lint -- --fix

# Verificar tipos TypeScript
npx tsc --noEmit
```

## 🌐 Internacionalización (i18n)

### Estructura de Traducciones
```
public/locales/
├── es/common.json    # Español (por defecto)
└── en/common.json    # Inglés
```

### Agregar Nuevas Traducciones
1. **Editar archivos JSON:**
   ```json
   {
     "nueva_seccion": {
       "titulo": "Nuevo Título",
       "descripcion": "Nueva descripción"
     }
   }
   ```

2. **Usar en componentes:**
   ```typescript
   const { t } = useTranslation('common');
   return <h1>{t('nueva_seccion.titulo')}</h1>;
   ```

### Agregar Nuevo Idioma
1. Crear directorio: `public/locales/fr/`
2. Copiar `common.json` y traducir
3. Actualizar [`next-i18next.config.js`](next-i18next.config.js):
   ```javascript
   locales: ['es', 'en', 'fr']
   ```

## 🎨 Sistema de Estilos

### Tailwind CSS
- **Configuración:** [`tailwind.config.ts`](tailwind.config.ts)
- **Estilos globales:** [`app/globals.css`](app/globals.css)
- **Componentes:** Usar clases utilitarias

### Temas (Claro/Oscuro)
```css
/* Variables CSS en globals.css */
:root {
  --background: 0 0% 100%;
  --foreground: 220 9% 9%;
}

[data-theme="dark"] {
  --background: 220 13% 9%;
  --foreground: 220 9% 98%;
}
```

### Agregar Nuevos Estilos
1. **Usar clases Tailwind existentes** (preferido)
2. **Extender configuración** en tailwind.config.ts
3. **CSS personalizado** solo si es necesario

## 🔄 Procesamiento PDF

### Librerías Utilizadas
- **pdf-lib:** Manipulación de PDFs
- **react-dropzone:** Drag & drop de archivos

### Estructura de Herramientas
```typescript
// data/tools.json
{
  "slug": "nombre-herramienta",
  "title": "Título en español",
  "titleEn": "Title in English",
  "description": "Descripción",
  "category": "edicion|conversion|seguridad",
  "icon": "heroicon-name"
}
```

### Agregar Nueva Herramienta PDF
1. **Agregar entrada en [`data/tools.json`](data/tools.json)**
2. **Crear lógica de procesamiento en [`utils/pdfProcessing.ts`](utils/pdfProcessing.ts)**
3. **Crear página en [`pages/[slug].tsx`](pages/[slug].tsx)**
4. **Agregar traducciones**

## 🚨 Solución de Problemas Comunes

### Error: "Module not found"
```bash
# Limpiar y reinstalar
rm -rf node_modules package-lock.json
npm install
```

### Error: "Port 3000 is already in use"
```bash
# Usar puerto diferente
npm run dev -- -p 3001

# O terminar proceso en puerto 3000
npx kill-port 3000
```

### Error: TypeScript compilation
```bash
# Verificar configuración
npx tsc --noEmit

# Limpiar caché TypeScript
rm -rf .next
npm run dev
```

### Error: Tailwind styles not loading
```bash
# Verificar configuración
npx tailwindcss -i ./app/globals.css -o ./output.css --watch

# Reiniciar servidor
npm run dev
```

## 📊 Monitoreo y Métricas

### Herramientas de Análisis
```bash
# Analizar bundle size
npm install --save-dev @next/bundle-analyzer
npm run build
npm run analyze

# Lighthouse audit
npx lighthouse http://localhost:3000

# Verificar rendimiento
npm run build && npm start
```

### Métricas Objetivo
- **First Contentful Paint:** < 1.5s
- **Largest Contentful Paint:** < 2.5s
- **Time to Interactive:** < 3s
- **Bundle size:** < 3MB

## 🔒 Seguridad

### Mejores Prácticas
- **Nunca enviar archivos a servidores externos**
- **Validar archivos antes del procesamiento**
- **Mantener dependencias actualizadas**
- **Usar HTTPS en producción**

### Auditoría de Seguridad
```bash
# Verificar vulnerabilidades
npm audit

# Corregir automáticamente
npm audit fix

# Verificar manualmente
npm audit --audit-level moderate
```

## 📚 Recursos y Documentación

### Documentación del Proyecto
- [`resumen-proyecto-swiftpdf.md`](resumen-proyecto-swiftpdf.md) - Visión general
- [`plan-ejecucion.md`](plan-ejecucion.md) - Guía de configuración
- [`arquitectura-proyecto.md`](arquitectura-proyecto.md) - Arquitectura técnica
- [`dependencias-tecnologias.md`](dependencias-tecnologias.md) - Stack tecnológico
- [`problemas-soluciones.md`](problemas-soluciones.md) - Troubleshooting

### Documentación Externa
- **Next.js:** https://nextjs.org/docs
- **React:** https://react.dev/
- **Tailwind CSS:** https://tailwindcss.com/docs
- **Radix UI:** https://www.radix-ui.com/primitives
- **pdf-lib:** https://pdf-lib.js.org/

## 🔄 Flujo de Trabajo Recomendado

### Para Nuevas Funcionalidades
1. **Analizar requisitos** y documentar
2. **Crear rama de desarrollo** (si usando Git)
3. **Implementar funcionalidad**
4. **Probar exhaustivamente**
5. **Actualizar documentación**
6. **Hacer merge a main**

### Para Corrección de Bugs
1. **Reproducir el problema**
2. **Documentar en [`problemas-soluciones.md`](problemas-soluciones.md)**
3. **Implementar solución**
4. **Verificar que no rompe otras funcionalidades**
5. **Actualizar documentación**

### Para Actualizaciones de Dependencias
1. **Revisar changelog** de la dependencia
2. **Actualizar en entorno de desarrollo**
3. **Probar funcionalidades críticas**
4. **Actualizar documentación si es necesario**
5. **Deploy gradual**

## 📞 Contacto y Soporte

### Información del Proyecto
- **Repositorio:** [URL del repositorio]
- **Documentación:** Archivos .md en el directorio raíz
- **Issues:** [URL de issues si aplica]

### Desarrolladores
- **Desarrollador Principal:** [Nombre]
- **Email:** [Email de contacto]
- **Última actualización:** 13 de Agosto, 2025

---

## 📋 Checklist de Handover

### Para Transferir el Proyecto
- [ ] Toda la documentación está actualizada
- [ ] Dependencias están al día y sin vulnerabilidades
- [ ] Todas las funcionalidades están probadas
- [ ] Variables de entorno documentadas
- [ ] Proceso de deployment documentado
- [ ] Contactos de soporte establecidos

### Para Recibir el Proyecto
- [ ] Leer toda la documentación
- [ ] Configurar entorno local
- [ ] Ejecutar todas las pruebas
- [ ] Familiarizarse con el código base
- [ ] Identificar áreas de mejora
- [ ] Establecer plan de mantenimiento

---

**Documento creado:** 13 de Agosto, 2025  
**Versión:** 1.0  
**Próxima revisión:** Después de cada actualización mayor del proyecto