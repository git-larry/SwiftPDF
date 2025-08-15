# SwiftPDF 🚀

**SwiftPDF** es una plataforma web moderna y gratuita que ofrece herramientas completas para el procesamiento de archivos PDF. Construida con Next.js 13, React 18 y TypeScript, proporciona una experiencia rápida, segura y completamente local.

![SwiftPDF Banner](public/images/banner.png)

## ✨ Características Principales

### 🛠️ Herramientas PDF Disponibles
- **Unir PDF** - Combina múltiples archivos PDF en uno solo
- **Dividir PDF** - Separa páginas específicas o divide por rangos
- **Comprimir PDF** - Reduce el tamaño de archivos manteniendo la calidad
- **Convertir Imágenes a PDF** - Convierte JPG, PNG, etc. a formato PDF
- **Convertir Word a PDF** - Transforma documentos .docx y .doc
- **Convertir Excel a PDF** - Convierte hojas de cálculo .xlsx y .xls
- **Proteger PDF** - Añade contraseñas y permisos de seguridad
- **Desproteger PDF** - Elimina contraseñas de documentos protegidos
- **Rotar PDF** - Rota páginas en cualquier dirección
- **Eliminar Páginas** - Borra páginas específicas de documentos

### 🎯 Características Técnicas
- ✅ **Procesamiento 100% Local** - Sin subida de archivos a servidores
- ✅ **Interfaz Moderna** - Diseño responsive con Tailwind CSS
- ✅ **Multiidioma** - Soporte completo para Español e Inglés
- ✅ **Vista Previa** - Visualización de PDFs antes del procesamiento
- ✅ **Historial Local** - Seguimiento de archivos procesados
- ✅ **Drag & Drop** - Carga de archivos intuitiva
- ✅ **Modo Oscuro** - Alternancia automática de temas
- ✅ **PWA Ready** - Instalable como aplicación web progresiva

## 🚀 Inicio Rápido

### Prerrequisitos
- Node.js 18.0 o superior
- npm 8.0 o superior

### Instalación

1. **Clona el repositorio**
   ```bash
   git clone https://github.com/your-username/swift-pdf.git
   cd swift-pdf
   ```

2. **Instala las dependencias**
   ```bash
   npm install
   ```

3. **Configura las variables de entorno (opcional)**
   ```bash
   cp .env.example .env.local
   # Edita .env.local según tus necesidades
   ```

4. **Inicia el servidor de desarrollo**
   ```bash
   npm run dev
   ```

5. **Abre en tu navegador**
   ```
   http://localhost:3000
   ```

## 📁 Estructura del Proyecto

```
swift-pdf/
├── app/                    # App Router de Next.js 13
│   ├── [slug]/            # Páginas dinámicas de herramientas
│   ├── tools/             # Páginas específicas de herramientas
│   ├── globals.css        # Estilos globales
│   ├── layout.tsx         # Layout principal
│   └── page.tsx           # Página de inicio
├── components/            # Componentes React reutilizables
│   ├── tools/            # Componentes de herramientas PDF
│   ├── ui/               # Componentes de interfaz base
│   └── ...               # Otros componentes
├── contexts/             # Contextos de React (idioma, tema, etc.)
├── hooks/                # Custom hooks
├── utils/                # Utilidades y helpers
├── data/                 # Datos estáticos (configuración de herramientas)
├── scripts/              # Scripts de construcción y optimización
└── public/               # Archivos estáticos
```

## 🔧 Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Inicia servidor de desarrollo
npm run lint             # Ejecuta ESLint
npm run lint:fix         # Corrige errores de lint automáticamente
npm run type-check       # Verifica tipos TypeScript

# Construcción
npm run build            # Construye para producción
npm run build:prod       # Construcción optimizada con verificaciones
npm run start            # Inicia servidor de producción
npm run export           # Exporta como sitio estático

# Utilidades
npm run optimize         # Ejecuta optimizaciones pre-build
npm run clean            # Limpia directorios de construcción
npm run analyze          # Analiza el bundle de producción
```

## 🌐 Tecnologías Utilizadas

### Frontend
- **[Next.js 13](https://nextjs.org/)** - Framework React con App Router
- **[React 18](https://reactjs.org/)** - Biblioteca de interfaz de usuario
- **[TypeScript](https://www.typescriptlang.org/)** - Tipado estático
- **[Tailwind CSS](https://tailwindcss.com/)** - Framework de estilos
- **[Radix UI](https://www.radix-ui.com/)** - Componentes primitivos accesibles

### Procesamiento PDF
- **[pdf-lib](https://pdf-lib.js.org/)** - Manipulación de PDFs en JavaScript
- **[react-dropzone](https://react-dropzone.js.org/)** - Carga de archivos drag & drop

### Herramientas de Desarrollo
- **[ESLint](https://eslint.org/)** - Linting de código
- **[Prettier](https://prettier.io/)** - Formateo de código
- **[Framer Motion](https://www.framer.com/motion/)** - Animaciones

## 🔒 Seguridad y Privacidad

- **Procesamiento Local**: Todos los archivos se procesan completamente en el navegador del usuario
- **Sin Subida de Archivos**: Ningún archivo se envía a servidores externos
- **Sin Almacenamiento**: Los archivos no se almacenan ni guardan en ningún lugar
- **Código Abierto**: El código fuente es completamente transparente y auditable

## 🌍 Internacionalización

SwiftPDF soporta múltiples idiomas:
- 🇪🇸 **Español** (por defecto)
- 🇺🇸 **English**

### Añadir Nuevos Idiomas

1. Crea archivos de traducción en `public/locales/[idioma]/`
2. Actualiza el componente `LanguageContext`
3. Añade las traducciones en `data/tools.json`

## 📱 PWA (Progressive Web App)

SwiftPDF está optimizada para funcionar como una PWA:
- Instalable en dispositivos móviles y escritorio
- Funciona offline para funciones básicas
- Actualizaciones automáticas
- Icono de aplicación personalizado

## 🚀 Despliegue

### Vercel (Recomendado)
```bash
# Instala Vercel CLI
npm i -g vercel

# Despliega
vercel --prod
```

### Netlify
```bash
# Construye el proyecto
npm run build

# Sube la carpeta .next a Netlify
```

### Docker
```bash
# Construye la imagen
docker build -t swift-pdf .

# Ejecuta el contenedor
docker run -p 3000:3000 swift-pdf
```

### Exportación Estática
```bash
# Genera sitio estático
npm run export

# Sirve desde cualquier hosting estático
```

## 🤝 Contribución

Las contribuciones son bienvenidas! Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### Desarrollo Local

1. Instala las dependencias: `npm install`
2. Ejecuta los tests: `npm run test`
3. Verifica el linting: `npm run lint`
4. Verifica los tipos: `npm run type-check`

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Ve el archivo [LICENSE](LICENSE) para más detalles.

## 📞 Soporte

- **Documentación**: [Consulta la wiki](https://github.com/your-username/swift-pdf/wiki)
- **Issues**: [Reporta bugs o solicita features](https://github.com/your-username/swift-pdf/issues)
- **Discusiones**: [Únete a las discusiones](https://github.com/your-username/swift-pdf/discussions)

## 🙏 Agradecimientos

- [pdf-lib](https://pdf-lib.js.org/) por la excelente biblioteca de manipulación de PDFs
- [Heroicons](https://heroicons.com/) por los iconos hermosos
- [Radix UI](https://www.radix-ui.com/) por los componentes accesibles
- La comunidad de Next.js y React por el ecosistema increíble

---

**Desarrollado con ❤️ por el equipo de SwiftPDF**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/import/project?template=https://github.com/your-username/swift-pdf)