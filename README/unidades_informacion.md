# Información sobre cómo cargar y mostrar una Unidad

Este documento explica, de forma práctica y sin referencias a funciones internas antiguas, qué endpoints del backend hay que consultar al entrar a una unidad, cómo interpretar sus respuestas y cómo tratarlas para mostrarlas en la UI.

Resumen del flujo al entrar a una unidad:
- Obtener metadatos de todas las unidades (índices base y conteos).
- Pedir el índice (lista de ejercicios) de la unidad seleccionada.
- Mostrar el índice (agrupado por habilidad si aplica) y permitir navegación a ejercicios.
- Al abrir un ejercicio, pedir su contenido por índice absoluto.
- Informar al backend de la posición / progreso y enviar calificaciones cuando el usuario complete la actividad.

1) Obtener metadatos de unidades

- Endpoint: `GET /exercises/por-unidad`
- Propósito: devolver la lista de unidades reconocidas por el backend con información mínima necesaria para calcular índices absolutos y límites de compra/progreso.
- Ejemplo de respuesta (HTTP 200):

```
[
  {
    "displayUnidad": "1",        // identificador de unidad visible (string)
    "title": "Unit 1: Present Simple",
    "startIndex": 0,              // índice absoluto del primer ejercicio de esta unidad
    "count": 20,                  // número de ejercicios dentro de la unidad
    "level": 1,                   // (opcional) nivel o bloque
    "boughtUpTo": 5               // (opcional) índice o contador hasta donde el usuario compró/tuvo acceso
  },
  {
    "displayUnidad": "2",
    "title": "Unit 2: Past Simple",
    "startIndex": 20,
    "count": 22
  },
  ...
]
```

Notas de uso:
- `startIndex` es la clave para convertir la posición relativa del índice de la unidad (p. ej. `indicePosition`) en el índice absoluto usado por el endpoint de ejercicio individual.
- Guardar/cachear esta lista (por ejemplo en memoria o en store) para evitar repetir la petición en cada navegación de unidad.

2) Pedir el índice (lista de ejercicios) de una unidad

- Endpoint: `GET /exercises/{displayUnidad}/indice`
- Parámetro: `displayUnidad` es el identificador de la unidad que viene en `displayUnidad` de la respuesta anterior.
- Propósito: devuelve el 'índice' de la unidad: listado secuencial de items (ejercicios) con metadatos para mostrarlos en el índice (títulos, habilidad, duración, estado local, etc.).
- Ejemplo de respuesta (HTTP 200):

```
{
  "unidad": "1",
  "title": "Unit 1: Present Simple",
  "items": [
    {
      "position": 0,                // posición dentro de la unidad (0..count-1)
      "title": "Gap fill: verbs",
      "skill": "grammar",        // skill / categoría (puede usarse para agrupar visualmente)
      "type": "tipo3",           // tipo de ejercicio (usar para elegir template de render)
      "estimatedSeconds": 45,
      "hasAudio": true,
      "status": "locked|available|done", // (opcional) si el backend lo proporciona
      "metadata": { }
    },
    ...
  ]
}
```

Notas de uso:
- Mostrar el índice como lista o como árbol agrupado por `skill` si se desea.
- Cada item incluye `position` (relativo); para abrir un ejercicio necesitamos convertirlo a índice absoluto.

3) Calcular índice absoluto de un ejercicio

- Fórmula: `absoluteIndex = unidadMeta.startIndex + item.position`
- Ejemplo: si `startIndex = 20` y `item.position = 3`, entonces `absoluteIndex = 23`.

4) Pedir el contenido de un ejercicio

- Endpoint: `GET /exercises/{index}`
- Parámetro: `index` es el índice absoluto calculado en el paso anterior.
- Propósito: devolver la especificación completa del ejercicio para renderizar (pregunta, opciones, multimedia, solución/feedback, propiedades de evaluación).
- Ejemplo de respuesta (HTTP 200):

```
{
  "index": 23,
  "displayUnidad": "2",
  "position": 3,
  "type": "tipo3",
  "question": "Complete the sentence with the correct verb form",
  "options": [
    { "id": "a", "text": "goes" },
    { "id": "b", "text": "go" },
    { "id": "c", "text": "went" }
  ],
  "media": {
    "images": ["https://.../img1.jpg"],
    "audio": ["https://.../audio1.mp3"],
    "video": []
  },
  "solution": {
    "correctOptionId": "a",
    "explanation": "Porque el sujeto es he/she y toma -s"
  },
  "scoring": {
    "maxScore": 1,
    "minScore": 0
  },
  "meta": {
    "timeLimitSeconds": 60,
    "difficulty": "medium"
  }
}
```

Notas de uso en la UI:
- Seleccionar plantilla de render según `type`.
- Mostrar multimedia si existe (`media.images`, `media.audio`).
- Preparar el flujo de respuesta del alumno (selección, envío) usando los campos `options` y `solution`.

5) Actualizar posición / progreso (cuando el usuario avanza)

- Endpoint: `POST /statistics/position`
- Propósito: notificar al backend la posición actual del usuario (útil para sincronizar progreso y para mostrar la última posición en otras sesiones).
- Ejemplo de payload (request):

```
{
  "exerciseIndex": 23,
  "position": 3,
  "timestamp": "2025-11-19T12:34:56Z"
}
```

- Ejemplo de respuesta (HTTP 200):

```
{ "ok": true }
```

Notas:
- Incluye `Authorization: Bearer <token>` en la cabecera. Si el backend responde 401, redirigir a `/login`.
- El backend puede devolver más detalles (nuevo progreso de la unidad); si los devuelve, actualizar UI con esa información en vez de inferirla localmente.

6) Enviar calificación / resultado de intento

- Endpoint: `POST /statistics/user-grade`
- Propósito: enviar la nota del intento, para que el backend actualice calificaciones, medias por usuario o indicadores de completado.
- Ejemplo de payload (request):

```
{
  "exerciseIndex": 23,
  "grade": 1,
  "correct": true,
  "timeSpentSeconds": 12
}
```

- Ejemplo de respuesta (HTTP 200):

```
{
  "ok": true,
  "newAverage": 0.87,
  "unitProgress": 0.45
}
```

Notas:
- Mostrar feedback inmediato al usuario (acierto/explicación) y actualizar los indicadores de progreso según la respuesta del backend.

7) Consultas de estadísticas para mostrar progreso en la UI

- Endpoint (por unidad): `GET /statistics/{unidad}/own`
  - Retorna métricas propias del usuario para la unidad (progreso, aciertos, completados).
- Endpoint (global de usuario): `GET /statistics/global/own`
  - Retorna progreso por skill o métricas globales del usuario.
- Endpoint (promedios plataforma): `GET /statistics/global/unidades`
  - Retorna promedios por unidad en la plataforma (útil para comparar rendimiento del usuario con la media).

Ejemplo de respuesta para `GET /statistics/{unidad}/own`:

```
{
  "unidad": "2",
  "completedCount": 10,
  "totalCount": 22,
  "progress": 0.4545,
  "scoreAverage": 0.78
}
```

Uso en UI:
- Mostrar barra de progreso: `progress * 100`.
- Mostrar "Unidades terminadas" sumando `progress === 1` entre unidades, o usar `completedCount === totalCount`.

8) Buenas prácticas de UI/UX y manejo de datos

- Prefetch: después de listar items del índice, prefetch (o lazy-load) el contenido del primer ejercicio visible para acelerar la apertura.
- Agrupación: agrupar por `skill` si el índice contiene ese campo para mejorar navegación.
- Estado local vs remoto: preferir el dato remoto si el endpoint de estadísticas devuelve `unitProgress` o `completedCount`. Si no está disponible, inferir localmente: `doneCount / totalCount` contando items con `status === 'done'`.
- Errores y reintentos: ante error de red, mostrar mensaje y permitir reintentar; ante 401, forzar login.
- Envelope API: detectar si la respuesta viene envuelta en `{ "data": ... }` y desempaquetar automáticamente si es necesario.
- Multimedia: normalizar URLs (asegurarse que sean absolutas). Prever controles de carga y reproducir audio/video con fallback.

9) Secuencia típica completa (resumen rápido)

1. `GET /exercises/por-unidad` → obtener `startIndex` y `count`.
2. `GET /exercises/{displayUnidad}/indice` → mostrar lista/índice de items por posición.
3. Usuario abre item con `position` → calcular `absoluteIndex = startIndex + position`.
4. `GET /exercises/{absoluteIndex}` → renderizar ejercicio según `type` y `media`.
5. Al avanzar: `POST /statistics/position` (sincronizar posición).
6. Al enviar respuesta: `POST /statistics/user-grade` → actualizar UI con nuevo `unitProgress` si el backend lo devuelve.

10) Manejo de casos especiales

- Unidades no compradas: si `boughtUpTo` existe y el item supera dicho límite, mostrar lock y bloqueo en la navegación.
- Ejercicios eliminados/índices desincronizados: si `absoluteIndex` 404, mostrar mensaje y refrescar `GET /exercises/por-unidad`.
- Cambios en la API: validar campos esperados y usar valores por defecto seguros (ej. `items: []`, `count: 0`).

---

Este documento está pensado para ser la guía práctica que use el frontend al entrar en una unidad: qué pedir, qué esperar, cómo mostrar y cómo actualizar el backend de progreso. Si quieres, puedo adaptar este documento a un checklist de implementacion o convertir los ejemplos JSON en tipados TypeScript para integrarlos directamente en el proyecto.
