# Marcar avance de un ejercicio (endpoints y payloads)

Documento directo y práctico que indica **cuándo** y **cómo** marcar avance de un ejercicio. SOLO endpoints y qué enviar/esperar.

## 1) Resumen rápido
- Video: se marca completado cuando el reproductor indica que el usuario reproducido >= 75% del total reproducido (`totalPlayed >= duration * 0.75`).
- Otros ejercicios: se marca completado cuando el usuario entrega/guarda la calificación o cuando el flujo determina que quedó completado (por ejemplo respuesta correcta definitiva).
- Persistencia en servidor: usar `POST /statistics/position` para sincronizar posición; usar `POST /statistics/user-grade` para enviar calificaciones/resultados.

## 2) Endpoints relevantes

- Obtener credenciales de reproducción (si aplica):
  - GET `/vdocipher/{videoId}`
  - Respuesta esperada: `{ "otp": "...", "playbackInfo": "..." }` o en fallo `"fallo"` / error 4xx-5xx.

- Obtener ejercicio completo (para leer metadatos, timestamps, tipo):
  - GET `/exercises/{absoluteIndex}`
  - Respuesta esperada: objeto con campos clave: `_id`, `index`, `displayUnidad`, `position`, `type`, `media`, `answers`, `completedByUser`, `meta`, ...

- Sincronizar posición / avance actual del usuario:
  - POST `/statistics/position`
  - Payload típico A (unidad + posición relativa):

```json
{
  "unidad": "2",
  "position": 3
}
```

  - Payload alternativo B (si el backend admite índice absoluto):

```json
{
  "exerciseIndex": 23
}
```

  - Respuesta esperada: `{ "ok": true }` o similar. Puede devolver datos adicionales de progreso.

- Enviar calificación / resultado de intento:
  - POST `/statistics/user-grade`
  - El front antiguo envía los datos empaquetados en base64 en la propiedad `payload`. El contenido base64 debe ser el JSON con `exerciseId`, `grade` y `unit`.

Ejemplo (contenido antes de base64):
```json
{ "exerciseId": "6421a...", "grade": 1, "unit": "2" }
```

Ejemplo petición (body enviado):
```json
{ "payload": "eyJleGVyY2..." }
```

Respuesta esperada: `{ "ok": true, "newAverage": 0.87, "unitProgress": 0.45 }` (puede variar).

## 3) Flujo detallado: Video

1. Obtener credenciales: `GET /vdocipher/{videoId}` → obtener `{ otp, playbackInfo }`.
2. Insertar iframe: `https://player.vdocipher.com/v2/?otp={otp}&playbackInfo={playbackInfo}` y asegurar SDK cargado.
3. Mientras se reproduce, consultar la API del player para `totalPlayed` y `duration`.
4. Condición de completitud: si `totalPlayed >= duration * 0.75` → considerar el video como visto/terminado.
5. Acciones al cumplirse la condición:
   - Actualizar estado local (ej.: marcar `completedByUser: true`, `gradeByUser: 1` en el índice local para que la UI lo muestre).
   - Llamar a `POST /statistics/position` para sincronizar la posición actual (ej. `{ unidad: "2", position: 3 }`).
   - Si el flujo requiere persistir nota final, llamar `POST /statistics/user-grade` con `{ exerciseId, grade, unit }` (empaquetado en base64 si el backend lo exige).

## 4) Flujo detallado: Otros tipos de ejercicios (no video)

1. Obtener ejercicio: `GET /exercises/{absoluteIndex}` → revisar `type`, `options`, `answers`, `meta`.
2. Ejecución del ejercicio en cliente (selección, respuesta, tiempo, etc.).
3. Al comprobar resultado / finalizar intento:
   - Si hay nota definitiva o el usuario guarda la calificación → llamar `POST /statistics/user-grade` con `{ exerciseId, grade, unit }` (ver formato arriba).
   - Siempre que el usuario avance de posición (siguiente/anterior o al terminar unidad), llamar `POST /statistics/position` con `{ unidad, position }`.

## 5) Casos y excepciones

- Si `GET /vdocipher/{videoId}` devuelve `"fallo"` o error: mostrar mensaje "No se pudo cargar el video" y ofrecer reintento; no marcar completado.
- Si `POST /statistics/position` falla: revertir actualización optimista y ofrecer reintento; mostrar aviso al usuario.
- Si `POST /statistics/user-grade` falla: notificar al usuario y permitir reintento (Grade modal normalmente muestra botón "Guardar" nuevamente).
- Si el ejercicio ya figura `completedByUser: true` en la respuesta de `GET /exercises/{index}`, no volver a enviar calificación salvo que se desee actualizar nota.

## 6) Recomendaciones prácticas

- Umbral: usar 75% (coherente con el front viejo) para marcar video como completado.
- Envío de posición: emplear `{ unidad, position }` para `POST /statistics/position` (si backend lo soporta), porque permite reconstruir la navegación relativa por unidad.
- Envío de nota: usar `{ exerciseId, grade, unit }` y, si la API lo requiere, envolver en base64 en `payload`.
- Preferir datos devueltos por `POST /statistics/user-grade` (por ejemplo `unitProgress` o `newAverage`) para actualizar UI final en vez de confiar sólo en el cálculo local.

---

Este documento es la guía mínima para integrar el marcado de avance en el frontend usando los endpoints del backend. Si querés, lo coloco también en `README/estadisticas.md` o genero snippets `curl`/`fetch` listos para copiar.
