**Unidades**

- **Endpoint (lista de unidades):** `GET /exercises/por-unidad`
  - **Qué devuelve:** un objeto con, como mínimo, las siguientes propiedades:
    - `unidades`: estructura con información por unidad (puede incluir `startIndex`, `count`, etc.)
    - `boughtUpTo`: número máximo de unidades concedidas por plan/administración
    - `position` (o `posicionPorUnidad`): posición actual por unidad (avance del usuario)
  - **Para qué usarlo:** poblar la vista principal de unidades y los estados necesarios para calcular acceso y progreso.

- **Reglas para entrar a una unidad (resumen)**
  - **Comprueba el tope de plan:** `user.boughtUpTo` — si `unitPosition > boughtUpTo` → puede estar bloqueada.
  - **Navegación libre:** si `user.freeNavigation === true` y `unitPosition <= boughtUpTo` → acceso permitido.
  - **Institución:** si `user.institutionId` existe, la institución puede controlar acceso (ver `institutionLicenseDate` y `boughtUpTo`).
  - **Suscripción activa:** `user.subscriptionValidUntil` debe ser una fecha futura para usuarios con subscripción individual.
  - **Unidades extra:** `user.extraUnitsRequested` tiene un límite mensual (p. ej. 5) que puede bloquear nuevas unidades de premio.
  - **Progresión:** `user.atUnit` controla que no se salte demasiadas unidades (habitualmente se exige `unitPosition <= atUnit + 1`).
  - **Restricción por perfil/plan:** `user.profileApplied?.units` puede listar unidades permitidas; si la unidad no está en esa lista → `Unidad no disponible en tu plan`.

- **Endpoint para detalle / índice de la unidad:**
  - `GET /exercises/:unidad/indice` → devuelve el índice/listado de ejercicios de la unidad (se usa para generar el índice mostrado en la UI).
  - `GET /exercises/:index` → devuelve un ejercicio concreto (payload con `skill`, `title`, `attachedDocument`, `credentials`, `completedByUser`, etc.).

- **Cómo saber cuánto avance tiene una unidad / si está abierta**
  - **Progreso numérico:** usar `posicionPorUnidad[numeroUnidad]` y `unidadesData[numeroUnidad].count` → `progress = Math.round((posicion / count) * 100)`.
  - **Marcada como completada:** `unidadesStatus[numeroUnidad] === true` → progreso 100%.
  - **Datos requeridos en el frontend viejo:** `unidadesData`, `posicionPorUnidad`, `unidadesStatus`, y `user` (para `boughtUpTo`, `atUnit`, etc.). Estos se cargan desde `GET /exercises/por-unidad`.

- **Endpoints de actualización / control**
  - `POST /statistics/position` → actualizar posición del usuario dentro de una unidad (se usa al avanzar/retroceder ejercicios).
  - `POST /statistics/user-grade` → enviar nota/grade de un ejercicio (usado en ciertos tipos de ejercicio para computar premios o desbloqueos).
  - `PUT /users/update-but` → admin actualiza `boughtUpTo` (concede unidades manualmente).
  - `PUT /users/update-unidades` → actualizar las unidades de un usuario (propias o admin flow según la función en el backend).

Ejemplo de llamadas (front viejo - resumen):

```js
// Lista de unidades
const { data: exercisesPorUnidad } = await axios.get(`${ENV.server}/exercises/por-unidad`);
dispatch(setUnidadesData(exercisesPorUnidad.unidades));
dispatch(setBoughtUpTo(exercisesPorUnidad.boughtUpTo));
dispatch(setPosicionPorUnidad(exercisesPorUnidad.position));

// Obtener índice de la unidad
const { data: indice } = await axios.get(`${ENV.server}/exercises/${unidad}/indice`);

// Obtener ejercicio por índice
const { data: ejercicio } = await axios.get(`${ENV.server}/exercises/${index}`);
```

Referencia en el repo:
- `front_joaquin/src/services/ExercisesService.js` → `getExercisesPorUnidad`, `getUnidadIndice`, `getOneExercise`, `postUserPositions`, `postUserGrade`
- `front_joaquin/src/components/ProtectedRoutes/ProtectedRoute.jsx` → carga inicial de unidades
- `front_joaquin/src/pages/HomePage/HomePage.jsx` → reglas de acceso (`canAccessUnit`) y representación en UI
- `front_joaquin/src/pages/UnidadPage/UnidadPage.jsx` → flujo de carga de ejercicios, avance y finalización
 
**Cambios aplicados en `demo_ardumaker_principal` (resumen, complementar lo ya documentado)**

- **Objetivo:** que el demo consuma los endpoints del backend igual que el front viejo y que presente exactamente 64 unidades divididas en 3 niveles (Explorador / Cualificado / Maestro) con los nombres idénticos a los del front antiguo.

- **Endpoints implicados y uso en el demo:**
  - `GET /exercises/por-unidad` — se usa como fuente primaria. El demo ahora intenta normalizar su payload y, si falla, cae al mock.
  - `GET /users/own` — usado para obtener el perfil del usuario real (antes mock). El demo decodifica payloads base64 igual que el front viejo.

- **Qué se implementó en el demo (`src/data/unidades.ts`)**
  - Se añadió la lista canonical de 64 títulos (tomados de `HomePage.jsx` del front viejo) y se fuerza la representación de exactamente 64 unidades.
  - Se implementaron funciones reales:
    - `get_units_by_level_real()` — construye un array plano de 64 unidades (cada una contiene `id`, `number`, `title`, `description`, `count`, `startIndex`, `status`, `progress`, `caseImage`) usando datos del backend cuando estén presentes y valores por defecto cuando no.
    - `get_overall_progress_real()` — calcula `totalUnits`, `totalCompleted`, `percentage` y `levelProgress` (divide 64 en 22/22/20) a partir de `boughtUpTo` y la info del backend si existe.
    - `get_units_by_level_id_real(levelId)` — devuelve la sección de nivel solicitada (explorador/cualificado/maestro) reutilizando la lista generada.
  - Lógica de estado/progreso:
    - `status: 'completed'` si `unitNumber <= boughtUpTo`.
    - `status: 'in-progress'` si hay posición parcial (`position` / `posicionPorUnidad`) para esa unidad.
    - `progress` calculado como `Math.round((posicion / count) * 100)` cuando aplique.
  - División de niveles: fija en 22 unidades para `Explorador`, 22 para `Cualificado` y 20 para `Maestro` (suma 64). Esto replica la separación esperada por el front nuevo.
  - Caída a mock: si la normalización o la llamada al backend falla, la implementación vuelve al mock existente para mantener la app funcional.

- **Otras modificaciones relacionadas**
  - `src/lib/api.ts`: el helper de fetch en el demo ahora envía el token también en el header `Authorization: Bearer <token>` (además del header de compatibilidad `Autenticacion` cuando aplica), igual que el front viejo.
  - `src/hooks/useAuth.ts`: si falta la cookie de login (`Autenticacion`) el demo redirige a `/login`; en entorno de desarrollo puede seguir utilizando el mock tal como antes.
  - `src/data/profile.ts`: `get_user_profile` ahora intenta `GET /users/own`, decodifica payloads base64 si corresponde, hace `console.log` del usuario obtenido y cae al mock en caso de error.
