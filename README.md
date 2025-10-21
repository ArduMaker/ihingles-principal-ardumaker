# IH Ingles Academy - Academia de Inglés

Plataforma web educativa para profesionales latinoamericanos que buscan dominar el inglés de forma estratégica y gamificada.

## 🎯 Descripción del Proyecto

IH Ingles Academy es una academia de inglés online diseñada específicamente para profesionales ambiciosos de América Latina. La plataforma ofrece un método único llamado "The Kingdom of Words" que combina progresión estratégica, enfoque en conversación real y orgullo cultural.

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
│   ├── internal/          # Componentes del layout interno
│   │   ├── InternalLayout.tsx
│   │   ├── InternalNavbar.tsx
│   │   ├── InternalSidebar.tsx
│   │   └── MobileSidebar.tsx
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
│   ├── landing.ts
│   └── auth.ts          # Mock de autenticación
├── hooks/                # Custom hooks
│   ├── useApiState.ts   # Hook para gestión de estados de API
│   └── useAuth.ts       # Hook de autenticación
├── lib/
│   ├── api.ts           # Configuración y utilidades de API
│   └── utils.ts         # Utilidades generales
├── pages/               # Páginas de la aplicación
│   ├── Index.tsx        # Landing page
│   ├── Dashboard.tsx
│   ├── Unidades.tsx
│   ├── Biblioteca.tsx
│   ├── Vocabulario.tsx
│   ├── Progreso.tsx
│   ├── Productos.tsx
│   ├── Facturacion.tsx
│   ├── Perfil.tsx
│   ├── Modulo.tsx
│   ├── Terms.tsx
│   └── NotFound.tsx
├── types/               # Definiciones de TypeScript
│   ├── index.ts         # Interfaces globales
│   └── auth.ts          # Tipos de autenticación
└── index.css            # Estilos globales y design system
```

## 🎨 Sistema de Diseño

### Colores (HSL)

```css
--primary: 145 97% 28%        /* Verde principal #028C3C */
--primary-hover: 147 100% 16%  /* Verde oscuro #005326 */
--primary-light: 145 97% 95%   /* Verde claro para backgrounds */

/* Colores del área interna (Dashboard, etc.) */
--sidebar: 120 25% 93%            /* Verde claro sidebar */
--sidebar-foreground: 0 0% 29%    /* Texto del sidebar */
--sidebar-accent: 46 100% 44%     /* Amarillo para items activos */
--sidebar-accent-foreground: 0 0% 100%  /* Texto sobre amarillo */
--sidebar-border: 120 15% 85%     /* Bordes del sidebar */

--navbar: 0 0% 100%               /* Blanco navbar */
--navbar-foreground: 0 0% 15%     /* Texto navbar */
--navbar-border: 0 0% 90%         /* Bordes navbar */

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

### Sistema Mock Actual (Desarrollo)

En modo desarrollo, el sistema crea automáticamente una cookie de autenticación mock para facilitar las pruebas:

- Cookie: `Autenticacion`
- Se crea automáticamente en desarrollo si no existe
- Datos de usuario simulados (Alberto González)
- Al hacer logout, se elimina la cookie y redirige a `/`

### Flujo de Autenticación

1. Al cargar cualquier página protegida, `useAuth()` verifica la cookie
2. Si no existe cookie (y no está en desarrollo), redirige a `/` con mensaje
3. Si existe, carga datos del usuario (actualmente mock)
4. El `InternalLayout` valida la autenticación antes de renderizar

### Integración Futura con API

```typescript
// src/hooks/useAuth.ts
const checkAuth = async () => {
  const authCookie = Cookies.get(AUTH_COOKIE_NAME);
  if (!authCookie) return;
  
  try {
    const userData = await api<User>('/auth/verify');
    setUser(userData);
  } catch {
    logout();
  }
};
```

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
✅ Layout interno con navbar y sidebar implementado
✅ Sistema de autenticación mock implementado
✅ Todas las páginas internas creadas (estructura base)
⏳ Contenido específico de cada página pendiente
⏳ Integración con API real pendiente
⏳ Funcionalidad completa de módulos y unidades pendiente

## 🎨 Layout Interno

### Estructura del Layout

El `InternalLayout` envuelve todas las páginas protegidas y proporciona:

#### 1. Navbar Superior (InternalNavbar)
- **Altura fija**: 64px (h-16)
- **Elementos**:
  - Logo de IH Ingles Academy (izquierda)
  - Botón de menú móvil (< 1024px)
  - Información del usuario:
    - Nombre completo
    - Subtítulo/nivel (ej: "Level Maestro del Río de la Escritura")
    - Avatar circular
    - Escudo/badge (opcional)
- **Responsive**: Oculta texto del usuario en móviles pequeños

#### 2. Sidebar Lateral (InternalSidebar)
- **Ancho fijo**: 192px (w-48)
- **Solo visible en desktop** (>= 1024px)
- **Secciones**:
  - **APRENDIZAJE**:
    - Dashboard
    - Unidades (con icono de libro amarillo)
    - Biblioteca
    - Vocabulario
  - **GAMIFICACIÓN**:
    - Habilidades
  - **CONFIGURACIÓN**:
    - Productos
    - Planes
- **Footer fijo**:
  - Perfil de usuario
  - Botón de Salir
- **Estados**:
  - Item activo: Fondo amarillo (`bg-sidebar-accent`)
  - Hover: Fondo amarillo translúcido

#### 3. Sidebar Móvil (MobileSidebar)
- **Visible solo en móvil/tablet** (< 1024px)
- **Tipo**: Overlay lateral deslizable
- **Activación**: Botón hamburguesa en navbar
- **Ancho**: 256px (w-64)
- **Backdrop**: Semi-transparente con click para cerrar
- **Auto-cierre**: Al navegar a otra página

#### 4. Área de Contenido Principal
- **Comportamiento de scroll**:
  - El layout NO hace scroll
  - Solo el contenido (`main`) tiene scroll interno
  - Ocupa toda la altura restante de la ventana
- **Padding**: Manejado por cada página individual
- **Background**: Blanco (`bg-background`)

### Colores del Layout Interno

```css
/* Sidebar */
--sidebar: 120 25% 93%                  /* Verde menta claro */
--sidebar-foreground: 0 0% 29%          /* Gris oscuro para texto */
--sidebar-accent: 46 100% 44%           /* Amarillo dorado */
--sidebar-accent-foreground: 0 0% 100%  /* Blanco sobre amarillo */
--sidebar-border: 120 15% 85%           /* Verde muy claro */

/* Navbar */
--navbar: 0 0% 100%                     /* Blanco puro */
--navbar-foreground: 0 0% 15%           /* Gris muy oscuro */
--navbar-border: 0 0% 90%               /* Gris muy claro */
```

### Breakpoints Responsive

```css
/* Mobile first approach */
< 640px   (sm)  → Sidebar móvil, navbar compacto
640-1024px (md/lg) → Sidebar móvil, navbar normal
>= 1024px (lg)  → Sidebar fijo, layout completo
```

### Uso del Layout

Todas las páginas protegidas deben usar el `InternalLayout`:

```typescript
import { InternalLayout } from '@/components/internal/InternalLayout';

const MiPagina = () => {
  return (
    <InternalLayout>
      <div className="p-8">
        {/* Contenido de la página */}
      </div>
    </InternalLayout>
  );
};
```

### Protección de Rutas

El `InternalLayout` maneja automáticamente:
- ✅ Verificación de autenticación
- ✅ Loading state durante verificación
- ✅ Redirección a `/` si no hay sesión
- ✅ Toast de error explicativo
- ✅ Bloqueo de renderizado sin auth

## 🔄 Próximos Pasos

1. ~~Implementar sistema de autenticación~~ ✅ (Mock implementado)
2. ~~Crear layout compartido para páginas protegidas~~ ✅
3. Desarrollar contenido específico de dashboard
4. Conectar con API real
5. Implementar sistema de progreso completo
6. Agregar funcionalidad completa de módulos y unidades

---

**Desarrollado con** ❤️ **para profesionales latinoamericanos ambiciosos**
