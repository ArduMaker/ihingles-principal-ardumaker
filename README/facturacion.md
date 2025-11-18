**Facturación y Planes (Resumen del front viejo)**

Este documento explica cuándo, cómo y dónde se trata la facturación, planes y datos de suscripción en el front antiguo (`front_joaquin`). Está pensado para ayudar a portar o integrar la misma lógica en el demo.

**Integraciones externas**:
- **Stripe**: el frontend usa `@stripe/react-stripe-js` y `@stripe/stripe-js` y carga la clave pública desde `ENV.stripe_public_key`.
- **PayPal / Link de suscripción**: existe un flujo que devuelve un `link` desde el backend (`/billing/create-subscription`) y el frontend redirige al usuario.

**Archivos y componentes clave (front_joaquin)**
- `src/pages/PaymentPage/PaymentPage.jsx`: página de checkout (elección método, selección de moneda, free-trial, redirecciones a PayPal/Stripe).
- `src/pages/PaymentPage/StripeForm.jsx`: componente que envuelve `@stripe/react-stripe-js` y confirma pagos (free trial vs pago inmediato).
- `src/pages/BillingPage/BillingPage.jsx`: vista del usuario para ver su suscripción, próximo cobro, historial de pagos y cancelar subscripción.
- `src/pages/SubscriptionsPage/SubscriptionsPage.jsx`: panel de administración para crear/editar/publicar planes.
- `src/services/BillingService.js`: funciones que llaman los endpoints `/billing/*`.
- `src/services/UsersService.js`: endpoints de usuario relacionados con facturación (`update-svu`, `update-but`, `update-subscriptionID`, `request-extra-units`, `getUser()` que decodifica `/users/own`).
- `src/utils/utils.js`: utilidades como `getBillingFrequencyCaption` y `getFireInTheHoleLink`.

**Endpoints usados (frontend → backend)**
- `GET  /billing/plans?page=` → listar planes
- `GET  /billing/plans/:id` → detalles del plan (`getSubscriptionPlanDetailsById`)
- `GET  /billing/plans/publish` → planos publicados
- `POST /billing/create-subscription` → crea subscripción (devuelve `link` para PayPal u otro)
- `POST /billing/create-subscription-stripe` → crea subscripción con Stripe (acepta `payment_method_id` y `currency`)
- `POST /billing/stop-subscription` → cancelar subscripción
- `GET  /billing/my-data` → datos de facturación del usuario (bills, price, nextBillingTime, etc.)
- `GET  /billing/user-data/:user_id` → datos de facturación de otro usuario (admin)

Endpoints de usuario que afectan facturación / experiencia:
- `PUT  /users/update-svu` → actualizar `subscriptionValidUntil`
- `PUT  /users/update-but` → actualizar `boughtUpTo`
- `PUT  /users/update-subscriptionID` → actualizar `subscriptionID`
- `POST /users/request-extra-units` → pedir unidades premio
- `GET  /users/own` → devuelve objeto de usuario (en el front viejo viene base64 en `data` y se hace `JSON.parse(atob(data))`)

**Campos del objeto `user` relevantes**
- `subscriptionID`: indica que el usuario tiene una subscripción.
- `nextBillingTime`: fecha del próximo cobro (se usa para decidir estado activo/inactivo).
- `subscriptionValidUntil`: fecha final (fallback si falta `nextBillingTime`).
- `processingSubscription`: bandera cuando la subscripción está en proceso.
- `boughtUpTo`: hasta qué unidad el usuario ha comprado.
- `freeNavigation`: permiso para navegar libremente.
- `extraUnitsRequested`: número de unidades premio solicitadas.

**Flujos principales (alto nivel)**
1. Usuario elige plan → frontend muestra `PaymentPage` con `getSubscriptionPlanDetailsById(plan_id)`.
2. Usuario selecciona método de pago:
   - PayPal / Link: `requestSubscriptionLink(plan_id)` → backend devuelve `link` → frontend redirige.
   - Stripe: si hay free-trial, frontend crea `PaymentMethod` (Stripe) y llama `createSubscriptionStripe(plan_id, payment_method_id, currency)`; si no hay free-trial, backend devuelve `clientSecret` y frontend confirma pago con `stripe.confirmCardPayment(clientSecret, ...)`.
3. Backend guarda/actualiza la subscripción y el frontend muestra `BillingPage` con `billing/my-data` y actualiza campos del `user` (p. ej. `subscriptionID`, `nextBillingTime`, `subscriptionValidUntil`).
4. Usuario puede cancelar con `stopSubscription()`.

**Administración de planes**
- Crear/editar/publicar/despublicar planes desde `SubscriptionsPage` → llamadas a `/billing/plans` (POST/GET/UPDATE/DELETE) y `/billing/plans/publish`.
- Los planes pueden tener: `price`, `billing_frequency`, `hasFreeTrial`, `additional_currencies`, `totalCycles`, `profile` (perfil que define unidades y habilidades incluidas).
- Los `profiles` se gestionan vía `/billing/profiles` (crear/editar/eliminar) y se asocian a planes.

**Pantallas de usuario relacionadas**
- `BillingPage` muestra estado actual y listado de `bills` devueltos por `billing/my-data`.
- `ActiveSubscriptionFormBilling` / `InactiveSubscriptionNotExpiredFormBilling` / `NotSuscribedFormBilling` renderizan distintos estados (activa, inactiva, sin subscripción).

**Utilidades y detalles**
- `getBillingFrequencyCaption(frequency)` convierte `DAY|WEEK|MONTH|YEAR` a texto local.
- `getFireInTheHoleLink(plan_id)` arma un link promocional `window.location.origin + '/fith/' + plan_id`.
- Formato de fechas: `moment`/`moment-timezone` se usa para formatear en `BillingPage`.

**Sugerencias para portar al demo**
- Implementar (o mapear) los mismos endpoints `/billing/*` y `/users/*` en los servicios del demo (`src/lib/api.ts` o `src/data/*`).
- Reutilizar el flujo de Stripe: crear un componente similar a `StripeForm` y cargar la clave pública desde `env` del demo.
- Asegurarse que el demo envíe el Authorization header igual que el front viejo y decodifique `/users/own` tal y como hace `getUser()` (base64 → JSON) si el backend sigue devolviendo esa forma.
- Mapear los campos del `user` (p. ej. `subscriptionID`, `nextBillingTime`, `subscriptionValidUntil`, `boughtUpTo`) para mostrar el estado en `Perfil`/`Billing` y para habilitar/cambiar UIs (solicitar unidades extra, cancelar suscripción, etc.).

**Dónde buscar el código original**
- Pagos / Checkout: `front_joaquin/src/pages/PaymentPage/*`
- Stripe form: `front_joaquin/src/pages/PaymentPage/StripeForm.jsx`
- Billing UI: `front_joaquin/src/pages/BillingPage/*`
- Planes (admin): `front_joaquin/src/pages/SubscriptionsPage/*` y `src/components/PlanCard`.
- Servicios: `front_joaquin/src/services/BillingService.js` y `src/services/UsersService.js`.

---

Archivo generado automáticamente a partir del análisis del front viejo para facilitar la migración/compatibilidad en el demo.
