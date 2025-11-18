# Estadísticas — Cómo pide el front viejo el progreso y la media

Este documento describe cómo el front original (`front_joaquin`) solicita y calcula:

- El progreso por unidad (por el usuario).
- El progreso global (por el usuario).
- La media (plataforma / comparación con otros usuarios).

Incluye los endpoints que se usan, cuándo se llaman dentro del flujo de la aplicación (por ejemplo, al hacer login) y ejemplos mínimos de peticiones/decodificaciones que el front realiza.

---

## Resumen rápido

- Datos de ejercicios por unidad y posiciones (para calcular el progreso por unidad) se solicitan justo después del login en el componente `ProtectedRoute`.
- Las estadísticas personales y por unidad se piden desde la página `Mi Progreso` (`MyProgressPage`) usando los endpoints `GET /statistics/global/own` y `GET /statistics/{unidad}/own`.
- La "media" (plataforma) se obtiene mediante endpoints globales como `GET /statistics/global/unidades` (datos para gráficas por unidades) y `GET /statistics/global/top-10` (ranking).
- Para enviar una nota/grade se usa `POST /statistics/user-grade` con un `payload` codificado en base64 (cliente hace `btoa(JSON.stringify(...))`).

---

## Endpoints relevantes (cliente)

Los servicios del front viejo están definidos en `src/services/*`. Aquí se listan las rutas y funciones cliente que encapsulan los requests:

- `GET /exercises/por-unidad`  -> `getExercisesPorUnidad()` (ExercisesService)
  - Uso: devuelve datos por unidad necesarios para calcular `unidadesData`, `position` (posiciones por unidad) y `boughtUpTo`.
  - Se llama en: `ProtectedRoute` una vez que el usuario está disponible (justo después del login/protección de rutas).
  - Forma de la respuesta esperada (shape observado en el cliente):
    {
      unidades: { [unidadNumber]: { count: number, ... } },
      boughtUpTo: number,
      position: { [unidadNumber]: number }
    }
  - El cliente almacena `unidades` en `state.datos.unidadesData`, `boughtUpTo` en `state.datos.boughtUpTo` y `position` en `state.datos.posicionPorUnidad`.

- `GET /statistics/global/own` -> `getOwnGlobalStatistics()` (StatisticsService)
  - Uso: obtiene las estadísticas globales del usuario (valores por habilidad: Grammar, Listening, Pronunciation, Reading, Speaking, Writing, Vocabulary y total).
  - Se usa en: `MyProgressPage` (cuando `unidadSelected === 'global'`) y también en otras vistas de estadísticas.
  - Forma de la respuesta (uso por la UI): un objeto con keys por habilidad y `total` (valores en rango 0..1). Ejemplo:
    { Grammar: 0.65, Listening: 0.5, ..., total: 0.58 }

- `GET /statistics/{unidad}/own` -> `getOwnUnidadStatistics(unidad)`
  - Uso: estadísticas del usuario para una unidad específica. Devuelve el mismo tipo de métricas pero referidas a esa unidad.
  - Se usa cuando el usuario selecciona una unidad en `Mi Progreso`.

- `GET /statistics/global/unidades` -> `getDataForLinearChart()`
  - Uso: devuelve datos para graficar la evolución por unidades comparando "plataforma" vs "usuario".
  - Forma esperada: array de entradas con `{ platform: {...}, user: {...} }` para cada punto del eje X; las propiedades internas incluyen habilidades (`Grammar`, etc.) con valores 0..1.

- `GET /statistics/global/top-10` -> `getGlobalTop10()`
  - Uso: ranking/top-10 de usuarios por promedio global.

- `POST /statistics/user-grade` -> (via `postUserGrade(exerciseId, grade, unit)` en ExercisesService)
  - Uso: enviar la nota de un ejercicio para que el backend actualice estadísticas.
  - El cliente crea un objeto `{ exerciseId, grade, unit }`, lo transforma con `JSON.stringify` y luego `btoa(...)` y envía `{ payload }` al endpoint.
  - Ejemplo (cliente):
    const data = { exerciseId, grade, unit };
    const payload = btoa(JSON.stringify(data));
    POST /statistics/user-grade  { payload }

- `GET /statistics/position/user/{userId}` -> `getUserPositions(userId)`
  - Uso: obtener las posiciones del usuario (posiciones por unidad).

- `POST /statistics/position` -> `postUserPositions(unidad, position)`
  - Uso: actualizar la posición del usuario para una unidad.

---

## ¿Cuándo se piden los datos? (flujo de la app)

1. Login / autenticación
   - El front viejo usa Auth0. Una vez autenticado, se monta la app protegida y se renderiza `ProtectedRoute`.

2. ProtectedRoute (primera carga de datos protegidos)
   - Comportamiento: en `src/components/ProtectedRoutes/ProtectedRoute.jsx` la app verifica si `user` existe y si `posicionPorUnidad`, `unidadesData` o `boughtUpTo` no están presentes en el store.
   - Acción: ejecuta `getExercisesPorUnidad()` (junto con `getMaintenanceWindow()`), y con la respuesta hace `dispatch(setUnidadesData(exercisesPorUnidad.unidades))`, `dispatch(setBoughtUpTo(exercisesPorUnidad.boughtUpTo))`, `dispatch(setPosicionPorUnidad(exercisesPorUnidad.position))`.
   - Efecto: después de esto, `HomePage` y otras vistas protegidas disponen de la información necesaria para calcular el progreso por unidad.

3. Cálculo del progreso por unidad (código del cliente)
   - En `HomePage` existe la función `getProgress(numeroUnidad)` que calcula el porcentaje de progreso así:
     - Si `unidadesStatus[numeroUnidad] == true` → retorna `100` (unidad marcada como completada).
     - position = `posicionPorUnidad[numeroUnidad] ?? 0` (posición actual del alumno dentro de la unidad).
     - size = `unidadesData?.[numeroUnidad]?.count` (cantidad total de ejercicios en la unidad).
     - progress = `position === 0 ? 0 : Math.round((position / size) * 100)`.
   - Resultado: entero 0..100.

4. Página "Mi Progreso" (requests de estadísticas y media)
   - `MyProgressPage` (ruta de usuario) carga por defecto la estadística global llamando a `getOwnGlobalStatistics()` (cuando `unidadSelected === 'global'`).
   - Si el usuario elige una unidad en el selector, se llama `getOwnUnidadStatistics(unidad)` y se muestran las métricas de esa unidad.
   - Para la comparativa (pestaña "COMPARACIÓN CON LA MEDIA") se llama `getDataForLinearChart()` para obtener la serie por unidad que se plotea junto a la media.

5. Visualización de la media
   - Componente `StatisticsShower` recibe el objeto `statistics` (resultado de `getOwnGlobalStatistics` o de `getOwnUnidadStatistics`) y para cada habilidad (`Grammar`, `Listening`, etc.) muestra `Number(statistics[skill] * 100).toFixed(2) + '%'`.
   - La "media de todos" (plataforma) se obtiene como `platform` en cada punto devuelto por `GET /statistics/global/unidades` y en `getGlobalTop10()` para el ranking.

---

## Ejemplos concretos (cliente)

A continuación ejemplos sencillos en JavaScript (fetch) que replican lo que hace el cliente del front viejo. En producción se usa un wrapper de axios que inyecta el token (ver `AxiosService` en el front viejo).

1) Obtener datos por unidad (lo hace `ProtectedRoute` justo después de login):

```js
// GET /exercises/por-unidad
const res = await fetch(`${ENV.server}/exercises/por-unidad`, {
  headers: { Authorization: `Bearer ${token}` }
});
const body = await res.json();
// body.unidades -> objeto con info por unidad (p.ej. count)
// body.boughtUpTo -> número
// body.position -> objeto con posiciones por unidad
```

2) Calcular progreso por unidad (cliente):

```js
function getProgress(numeroUnidad, unidadesStatus, posicionPorUnidad, unidadesData) {
  if (unidadesStatus[numeroUnidad] === true) return 100;
  const position = posicionPorUnidad[numeroUnidad] ?? 0;
  const size = unidadesData?.[numeroUnidad]?.count;
  return position === 0 ? 0 : Math.round((position / size) * 100);
}
```

3) Obtener estadísticas globales del usuario:

```js
// GET /statistics/global/own
const { data } = await getAxiosInstance().get(`${ENV.server}/statistics/global/own`);
// data: { Grammar: 0.7, Listening: 0.6, ..., total: 0.65 }
```

4) Obtener estadísticas de una unidad específica:

```js
// GET /statistics/{unidad}/own
const unidad = 4;
const { data } = await getAxiosInstance().get(`${ENV.server}/statistics/${unidad}/own`);
// data: objeto con mismas claves pero referidas a la unidad seleccionada
```

5) Obtener datos para comparar con la media (gráfica por unidades):

```js
// GET /statistics/global/unidades
const { data } = await getAxiosInstance().get(`${ENV.server}/statistics/global/unidades`);
// data = [ { platform: { Grammar: 0.6, ... }, user: { Grammar: 0.7, ... } }, ... ]
```

6) Envío de nota (grade) para que se actualicen estadísticas:

```js
// POST /statistics/user-grade
const payloadObj = { exerciseId: 123, grade: 8, unit: 4 };
const payload = btoa(JSON.stringify(payloadObj));
await getAxiosInstance().post(`${ENV.server}/statistics/user-grade`, { payload });
```

7) Nota sobre `/users/own` (usuario):

- En el front viejo `UsersService.getUser()` hace `const { data } = await getAxiosInstance().get(`${ENV.server}/users/own`); const parsedData = JSON.parse(atob(data)); return { data: parsedData };` — esto significa que el backend devuelve un string codificado en base64 y el cliente lo decodifica con `atob` y `JSON.parse` para obtener el objeto `user`.

---

## Mapeo a la estructura interna del cliente (store)

- `state.datos.unidadesData` ← `exercisesPorUnidad.unidades` (cada unidad tiene al menos `.count` con el total de ejercicios).
- `state.datos.posicionPorUnidad` ← `exercisesPorUnidad.position` (posiciones por unidad para el usuario; se usan para calcular %).
- `state.datos.boughtUpTo` ← `exercisesPorUnidad.boughtUpTo` (límite de unidades compradas/acceso).
- `state.datos.unidadesStatus` ← se usa para marcar unidades completadas (`true` -> 100%). Este objeto puede ser actualizado por otras acciones cuando el backend indica unidad completada.

---

## Puntos importantes / recomendaciones

- El front viejo asume que la respuesta de `/users/own` viene codificada en base64. Si integras otro cliente, conserva esa decodificación o pide al backend enviar JSON sin codificar.
- Para garantizar que `getProgress` no divida por cero, el cliente primero revisa `size` (count) y maneja `position === 0` como 0%.
- Las estadísticas (global/por unidad) devuelven valores en rango 0..1; la UI multiplica por 100 para mostrar %.
- Si quieres replicar exactamente el comportamiento en el demo, debes:
  - Llamar a `GET /exercises/por-unidad` justo después de que el usuario esté autenticado (igual que `ProtectedRoute`).
  - Guardar la estructura en `state` y usar la función `getProgress` arriba para mostrar % por unidad.
  - Usar `GET /statistics/global/own` y `GET /statistics/{unidad}/own` desde la página `Mi Progreso` para obtener los valores de usuario/ media de plataforma.

---
