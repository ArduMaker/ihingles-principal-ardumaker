**User Login**

- **Endpoint:** `GET /users/own`
- **Método:** `GET`
- **Autenticación:** token de usuario. En el front viejo se envía como header `Authorization: Bearer <token>` (Auth0). En la demo nueva se puede leer desde la cookie `Autenticacion` y también se envía como header `Authorization: Bearer <token>` para compatibilidad.
- **Qué devuelve:** la API devuelve la información del usuario codificada (en el proyecto actual el body viene como una cadena base64 dentro de `data`). Hay que decodificar la base64 y luego parsear JSON.
- **Para qué usarlo:** obtener el perfil completo del usuario (nombre, roles, límites de unidades, fechas de suscripción, flags como `freeNavigation`, `suspended`, `isAdmin`, `isInstitution`, `boughtUpTo`, `atUnit`, `subscriptionValidUntil`, etc.).

Ejemplo de uso (front viejo - resumen):

```js
// UsersService.getUser (front_joaquin)
const { data } = await axios.get(`${ENV.server}/users/own`);
const parsedData = JSON.parse(atob(data));
// parsedData ahora es el objeto usuario
```

Notas prácticas:
- Siempre comprobar si la respuesta viene en `res.data` como cadena base64: si es así usar `atob()` y `JSON.parse()`.
- Autenticación: el backend valida el token (Bearer). Asegúrate de enviar `Authorization: Bearer <token>` en cada request o, si usas cookie `Autenticacion`, que el helper lo copie al header `Authorization`.
- Errores relevantes: si el servidor responde `401` la sesión expiró; `409` puede indicar sesión en uso o suspensión (front viejo guarda flags en `localStorage` y fuerza logout en esos casos).

Referencia en el repo:
- `front_joaquin/src/services/UsersService.js` → función `getUser()`
- `front_joaquin/src/App.jsx` → obtención del token con `getAccessTokenSilently()` e inyección en `axios` interceptor
