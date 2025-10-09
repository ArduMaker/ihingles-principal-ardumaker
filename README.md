# Valle's Systems - Academia de Inglés

Plataforma web educativa para profesionales latinoamericanos que buscan dominar el inglés de forma estratégica y gamificada.

## 🎯 Descripción del Proyecto

Valle's Systems es una academia de inglés online diseñada específicamente para profesionales ambiciosos de América Latina. La plataforma ofrece un método único llamado "The Kingdom of Words" que combina progresión estratégica, enfoque en conversación real y orgullo cultural.

## 🏗️ Arquitectura del Proyecto

### Páginas Principales

- **`/`** - Landing page pública (NO requiere autenticación)
- **`/dashboard`** - Panel principal del estudiante (requiere auth)
- **`/unidades`** - Lista de unidades de aprendizaje (requiere auth)
- **`/progreso`** - Visualización de progreso del estudiante (requiere auth)
- **`/biblioteca`** - Recursos y materiales (requiere auth)
- **`/facturación`** - Gestión de pagos y suscripciones (requiere auth)
- **`/vocabulario`** - Práctica de vocabulario (requiere auth)
- **`/modulo/{id_modulo}`** - Vista detallada de módulo específico (requiere auth)
- **`/perfil`** - Perfil del usuario (requiere auth)

### Estructura de Carpetas

```
src/
├── components/
│   ├── landing/          # Componentes de la landing page
│   │   ├── Header.tsx
│   │   ├── Hero.tsx
│   │   ├── MethodSection.tsx
│   │   ├── LexoSection.tsx
│   │   ├── StatsSection.tsx
│   │   ├── JourneySection.tsx
│   │   ├── TestimonialsSection.tsx
│   │   ├── CommunitySection.tsx
│   │   └── Footer.tsx
│   └── ui/               # Componentes UI reutilizables (shadcn)
├── data/                 # Datos mock para desarrollo
│   └── landing.ts
├── hooks/                # Custom hooks
│   └── useApiState.ts    # Hook para gestión de estados de API
├── lib/
│   ├── api.ts           # Configuración y utilidades de API
│   └── utils.ts         # Utilidades generales
├── pages/               # Páginas de la aplicación
│   ├── Index.tsx        # Landing page
│   └── NotFound.tsx     # 404
├── types/               # Definiciones de TypeScript
│   └── index.ts         # Interfaces globales
└── index.css            # Estilos globales y design system
```

## 🎨 Sistema de Diseño

### Colores (HSL)

```css
--primary: 145 97% 28%        /* Verde principal #028C3C */
--primary-hover: 147 100% 16%  /* Verde oscuro #005326 */
--primary-light: 145 97% 95%   /* Verde claro para backgrounds */
--background: 0 0% 100%        /* Blanco */
--foreground: 0 0% 15%         /* Texto principal */
--heading-color: 0 0% 10%      /* Títulos */
--text-color: 0 0% 25%         /* Texto cuerpo */
```

### Tipografía

- **Fuente Principal**: Playfair Display (Google Fonts)
- **Títulos (H1-H6)**: Playfair Display Bold (700) - 60px en hero principal
- **Párrafos**: Playfair Display Regular (400) - 20px
- **Responsive**: Se ajusta automáticamente con clamp() para diferentes dispositivos

### Componentes

Se utilizan componentes de **shadcn/ui** como base, personalizados con el design system de Valle's.

## 📡 Gestión de APIs

### Configuración Base

```typescript
// src/lib/api.ts
export const API_BASE_URL = 'https://api.vallesystems.com'
export const AUTH_COOKIE_NAME = 'Autenticacion'
```

### Método de Llamadas

Todas las llamadas al backend siguen este patrón:

```typescript
const data = await api<ResponseType>('/endpoint', {
  method: 'POST',
  body: JSON.stringify(payload)
});
```

El método `api()`:
- Agrega automáticamente la cookie de autenticación
- Maneja errores de forma consistente
- Muestra mensajes de error claros al usuario
- Retorna tipos seguros con TypeScript

### Hook de Estados

```typescript
const { isLoading, error, executeApi } = useApiState();

const result = await executeApi(() => api<Data>('/endpoint'));
```

Este hook:
- Gestiona estados de carga automáticamente
- Captura y muestra errores
- Proporciona feedback visual al usuario

## 🔒 Autenticación

- Cookie: `Autenticacion`
- Se incluye automáticamente en todas las peticiones
- Si expira o falla: redirección a `/` con mensaje

## 🗂️ Datos Mock

Durante desarrollo, las respuestas de API se simulan en `src/data/*.ts`:

```typescript
// src/data/landing.ts
export const mockFeatures: Feature[] = [...]
export const mockStats: Stat[] = [...]
```

## 📝 Reglas de Programación

### Límites y Modularización
- ✅ Máximo 150 líneas por archivo
- ✅ Componentes pequeños y reutilizables
- ✅ Sin repetición de código
- ✅ Un solo archivo de interfaces (`src/types/index.ts`)

### APIs
- ✅ URL base en variable global
- ✅ Cookie de autenticación automática
- ✅ Mensajes de error claros y no técnicos
- ✅ Gestión centralizada de estados de carga

### Estilos
- ✅ Todo en el design system (index.css)
- ✅ Colores semánticos (NO `text-white`, `bg-white`)
- ✅ Solo colores HSL
- ✅ Variantes de componentes bien definidas

## 🚀 Tecnologías

- **Framework**: React 18 + TypeScript
- **Build**: Vite
- **Estilos**: Tailwind CSS
- **Componentes**: shadcn/ui
- **Router**: React Router v6
- **Queries**: TanStack Query
- **Icons**: Lucide React

## 🛠️ Instalación y Desarrollo

```bash
# Instalar dependencias
npm install

# Servidor de desarrollo
npm run dev

# Build para producción
npm run build

# Preview de producción
npm run preview
```

## 📋 Estado Actual

✅ Landing page (`/`) completamente implementada
⏳ Páginas internas pendientes
⏳ Sistema de autenticación pendiente
⏳ Integración con API real pendiente

## 🔄 Próximos Pasos

1. Implementar sistema de autenticación
2. Crear layout compartido para páginas protegidas
3. Desarrollar dashboard
4. Conectar con API real
5. Implementar sistema de progreso
6. Agregar funcionalidad de módulos y unidades

---

**Desarrollado con** ❤️ **para profesionales latinoamericanos ambiciosos**
