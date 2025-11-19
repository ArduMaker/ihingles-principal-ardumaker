# Cómo obtener y renderizar videos (resumen práctico)

Este documento explica, de forma directa y sin referencias a métodos internos, qué endpoints pedir, qué respuestas esperar y cómo tratar los casos más comunes para reproducir un video instructivo en la UI.

1) Credenciales del reproductor
- Endpoint: `GET /vdocipher/{videoId}`
  - Parámetro: `videoId` (cadena que identifica el video en el backend).
  - Cabeceras: incluir `Authorization: Bearer <token>` si la API está protegida.
  - Respuesta esperada (HTTP 200):

```
{
  "otp": "...",            // one-time-play token
  "playbackInfo": "...",  // cadena con info de reproducción
  // pueden venir campos adicionales según el backend
}
```

Notas:
- Si la respuesta es exactamente la cadena `"fallo"` o viene con error 4xx/5xx, tratar como fallo y ofrecer reintento al usuario.
- Si `videoId` ya es una URL (p. ej. comienza con `https://`), no se piden credenciales: abrir la URL en nueva pestaña o incrustar según política de origen.

2) Reproductor en la UI
- Requisito en la página: incluir el SDK de VdoCipher (si se usa VdoCipher):

```html
<script src="https://player.vdocipher.com/v2/api.js"></script>
```

- Para renderizar el video usar un iframe con la URL construida así:

```
https://player.vdocipher.com/v2/?otp={otp}&playbackInfo={playbackInfo}
```

- Comportamiento esperado:
  - El iframe carga el reproductor con las credenciales recibidas (`otp` y `playbackInfo`).
  - Debe permitirse `allow="encrypted-media"` y `allowFullScreen`.

3) Supervisión de reproducción (para marcar completitud)
- Datos accesibles desde el reproductor:
  - `totalPlayed` (segundos reales reproducidos, desde la API del player).
  - `video.duration` (duración total en segundos).
  - `video.currentTime` (tiempo actual de reproducción).

- Lógica recomendada para considerar un video como "completado":
  - Si `totalPlayed >= duration * 0.75` → considerar completado (75% reproducido).

- Qué actualizar cuando se detecta completitud:
  - Habilitar el avance del ejercicio en la UI.
  - Actualizar el índice local para marcar `completedByUser: true` / `gradeByUser: 1` si corresponde.

4) Casos especiales y acciones
- Pausas programadas: si el ejercicio requiere interrupciones en timestamps (p. ej. pedir respuesta hablada en ciertos segundos), supervisar `video.currentTime` y comparar con la lista de timestamps del ejercicio.
- Video externo (URL en `videoId`): abrir en nueva pestaña o incrustar según permisos; no pedir credenciales.
- Errores al pedir credenciales: mostrar mensaje y ofrecer botón "Reintentar".
- Si el iframe devuelve 404/errores de CORS: comprobar que `otp`/`playbackInfo` sean válidos y que el SDK esté cargado.

5) Seguridad y cabeceras
- Siempre enviar el token (si la API está protegida): `Authorization: Bearer <token>`.
- No exponer secretos en el cliente: el backend debe devolver sólo las credenciales temporales (`otp`, `playbackInfo`) necesarias para la reproducción.

6) Dónde buscar las credenciales si faltan
- Primero: pedir `GET /vdocipher/{videoId}` al servidor (endpoint único que centraliza credenciales).
- Si el endpoint retorna error o `fallo`:
  - Revisar en el backend (servicio `/vdocipher` en el servidor) — ahí se obtienen las credenciales desde el proveedor (VdoCipher) o desde la base de datos.
  - Revisar la administración interna o panel de contenidos donde se asocian `videoId` con recursos (si existe).

7) Resumen de la secuencia mínima
1. Si `videoId` es URL absoluta → abrir la URL o incrustar directamente.
2. Si `videoId` es identificador: `GET /vdocipher/{videoId}` → obtener `{ otp, playbackInfo }`.
3. Construir iframe: `https://player.vdocipher.com/v2/?otp={otp}&playbackInfo={playbackInfo}`.
4. Insertar iframe en la UI y asegurar el SDK cargado.
5. Supervisar `totalPlayed` y `duration` → marcar completitud (p. ej. 75%).
6. En caso de error en credenciales → reintentar o reportar al usuario.

8) Ejemplo rápido de manejo (respuestas)
- Respuesta correcta del servidor:
```
{ "otp": "abc123", "playbackInfo": "xyz987" }
```
- En ese caso: incrustar iframe con `?otp=abc123&playbackInfo=xyz987`.
- Respuesta de fallo:
```
"fallo"
```
- En ese caso: mostrar mensaje "No se pudo cargar el video" y permitir reintento.

---

Si querés, lo agrego también al README principal como sección o genero un snippet listo para copiar en React (sin lógica de negocio) para incrustar el iframe y supervisar `totalPlayed`.
