# Biblioteca — Documentación de la migración

Este archivo documenta los cambios realizados para alinear la sección "Biblioteca" del proyecto demo (`demo_ardumaker_principal`) con los datos y comportamiento del front original (`front_joaquin`).

## Resumen de lo que hicimos
- Extraí los recursos y la estructura que estaban hardcodeados en el front viejo (`front_joaquin/src/pages/LibraryPage/LibraryPage.jsx`).
- Reemplacé el mock de la biblioteca del demo con los datos reales del front viejo.
- Añadí los enlaces (URLs de Google Drive) para cada recurso para que el demo abra exactamente el mismo material.
- Actualicé tipos y componentes para soportar y usar estos enlaces.

## Archivos modificados
- `src/data/biblioteca.ts`
  - Reemplacé el array de `mockDocuments` y `mockUnits` por los elementos reales extraídos del front viejo.
  - Cada documento ahora incluye el campo `url` con la URL pública tomada del front viejo (cuando existía).
  - Eliminé entradas sobrantes del mock original para dejar solamente los recursos reales.

- `src/types/index.ts`
  - Añadí `url?: string` al tipo `BibliotecaDocument` para permitir almacenar el enlace del recurso.

- `src/components/biblioteca/BibliotecaDocumentCard.tsx`
  - El enlace "Ver Documento" ahora abre `document.url` en una nueva pestaña (`target="_blank" rel="noopener noreferrer"`) si el `url` está presente. Si no hay enlace, muestra "Sin enlace".

- `src/components/biblioteca/BibliotecaResultCard.tsx`
  - El botón "Ver Documento" ahora abre `document.url` en una nueva pestaña usando `window.open(...)`.
  - Ajusté el cálculo del índice de thumbnail para soportar `id` que contienen letras (ej. `g1`, `4-1`).

## Nota importante sobre el front viejo
- En `front_joaquin`, la lista de recursos estaba *hardcodeada* dentro de `LibraryPage.jsx` (objeto `library` con categorías y pares título → URL). Es decir, no se estaba consumiendo una API para la Biblioteca, sino que los enlaces y títulos estaban escritos directamente en el código.
- Dado esto, la migración consistió en trasladar ese contenido estático al mock del demo para que la experiencia visual y los enlaces sean idénticos.

## Decisiones de mapeo
- La categoría "General" fue mapeada a `unitId: 'general'` y `id: 'general'` en `mockUnits`. Si prefieres mantener `id: 'all'` (o `Todos`) para compatibilidad con otras partes del demo, puedo cambiarlo rápidamente.
- Todos los recursos que en el front viejo tienen un enlace de Google Drive fueron añadidos exactamente con esa URL en el campo `url`.
- En el mock demo los campos `type` y `subtitle` fueron normalizados (mayoría como `pdf`) — si quieres que reflejen tipos concretos (`ppt`, `word`, etc.) los actualizo con los valores exactos.
