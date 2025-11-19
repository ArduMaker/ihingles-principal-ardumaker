# Obtener y tratar un ejercicio / Notificar avance

Documento corto y práctico: cómo pedir el contenido completo de un ejercicio, los casos posibles, y cómo notificar avance y calificaciones al backend.

1) Pedir el ejercicio (contenido completo)
- Endpoint: `GET /exercises/{absoluteIndex}`
  - `absoluteIndex`: índice absoluto entero del ejercicio en la base de datos.
  - Cabeceras: `Authorization: Bearer <token>`

- Respuesta esperada (200 OK) — ejemplo resumido:

```
{
  "_id": "6421a...",
  "index": 23,
  "displayUnidad": "2",
  "position": 3,
  "type": "tipo3",
  "title": "Gap fill: verbs",
  "skill": "grammar",
  "question": "Complete the sentence...",
  "options": [ ... ],
  "media": { "images": [...], "audio": [...], "video": [...] },
  "solution": { ... },
  "scoring": { "maxScore": 1 },
  "completedByUser": true|false,
  "credentials": { ... },
  "attachedDocument": { ... },
  "meta": { "timeLimitSeconds": 60 }
}
```

- Casos y cómo tratarlos:
  - 200: renderizar usando `type`. Mostrar `media`, `question`, `options`. Usar `_id` o `index` para identificadores en posteriores POSTs.
  - 401: redirigir a login o renovar token.
  - 404: índice inválido — refrescar `GET /exercises/por-unidad` para re-sincronizar `startIndex` y `count`; mostrar mensaje al usuario.
  - 5xx: mostrar error y permitir reintento.
  - Envelope: la API puede devolver `{ data: ... }` — extraer `data` si existe.

2) Cómo conseguir `absoluteIndex` (si sólo tenés unidad + posición)
- Si tenés `startIndex` de la unidad (desde `GET /exercises/por-unidad`):
  - `absoluteIndex = startIndex + item.position`
- Si no tenés `startIndex`, primero pedir:
  - `GET /exercises/por-unidad` → buscar la unidad por `displayUnidad` y leer `startIndex` y `count`.

3) Alternativa: pedir índice de la unidad y luego pedir ejercicio por posición
- `GET /exercises/{displayUnidad}/indice` → devuelve `items` con `position` (relativo). Mostrar índice antes de pedir contenido. Para abrir:
  - `absoluteIndex = startIndex + item.position` → `GET /exercises/{absoluteIndex}`.

4) Notificar avance de posición (cuando el usuario avanza o cambia de ejercicio)
- Endpoint: `POST /statistics/position`
- Propósito: sincronizar la posición del usuario para continuar desde otra sesión.
- Payloads comunes (ajustar a lo que acepte el backend):

Ejemplo A — enviar `unidad` + `position` (forma que usa el front actual):
```
POST /statistics/position
{
  "unidad": "2",
  "position": 3,
  "timestamp": "2025-11-19T12:34:56Z"
}
```

Ejemplo B — enviar índice absoluto (si el backend lo prefiere):
```
POST /statistics/position
{
  "exerciseIndex": 23,
  "timestamp": "2025-11-19T12:34:56Z"
}
```

- Respuesta esperada: `{ "ok": true }` o objeto con nuevo progreso. Si devuelve `unitProgress` usarlo para actualizar la UI.

5) Notificar calificación / resultado del intento
- Endpoint: `POST /statistics/user-grade`
- Propósito: enviar la nota para actualizar medias, completados y desbloqueos.
- Payload típico:

```
POST /statistics/user-grade
{
  "exerciseIndex": 23,    // o "exerciseId": "_id" según el backend
  "grade": 1,             // escala 0..1 o 0..100 según implementación
  "correct": true,
  "timeSpentSeconds": 12,
  "unidad": "2"         // opcional
}
```

- Respuesta esperada (ejemplo):
```
{ "ok": true, "newAverage": 0.87, "unitProgress": 0.45 }
```

6) Casos prácticos en el flujo de UI
- Antes de salir de una unidad, el front puede llamar `postUserGrade` para tipos concretos (p.ej. `type` 18 y 30) y luego `postUserPositions` para dejar la posición final.
- Si la petición de posición falla: revertir actualización optimista y mostrar opción de reintento.
- Evitar llamadas duplicadas: bloquear botón mientras POST está en curso.

7) Ejemplos `fetch` rápidos

Obtener ejercicio:
```js
const res = await fetch(`/exercises/${absoluteIndex}`, { headers: { Authorization: `Bearer ${token}` } });
const body = await res.json();
const ejercicio = body.data ?? body;
```

Notificar posición (unidad + posición):
```js
await fetch('/statistics/position', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
  body: JSON.stringify({ unidad: '2', position: 3, timestamp: new Date().toISOString() })
});
```

Enviar calificación:
```js
await fetch('/statistics/user-grade', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
  body: JSON.stringify({ exerciseIndex: 23, grade: 1, correct: true, timeSpentSeconds: 12 })
});
```

8) Buenas prácticas
- Prefetch del siguiente ejercicio tras cargar el actual.
- Usar identificador consistente (`index` o `_id`) en POSTs; confirmar con backend cuál prefiere.
- Normalizar respuestas envueltas (`data`) y URLs multimedia.
- Validar campos `media`, `timeLimitSeconds`, `completedByUser` antes de renderizar.
- Manejar 401 redirigiendo a login/renovando token.

