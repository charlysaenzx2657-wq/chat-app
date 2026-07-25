# Charlas — Chat en tiempo real (React + Firebase)

App de mensajería entre amigos: te registras con correo, obtienes un código único de 6 caracteres, y solo la gente que tenga tu código puede encontrarte y enviarte una solicitud de amistad. Una vez aceptada, chatean en tiempo real...

## Funciona así

1. Te registras con correo y contraseña → recibes tu código de amigo.
2. Para agregar a alguien, ingresas su código → ves su tarjeta (nombre) → envías solicitud.
3. La otra persona acepta o rechaza desde su panel de solicitudes.
4. Al aceptar, se crea un chat y pueden mandarse mensajes en tiempo real.

## 1. Configurar Firebase (una sola vez)

1. Ve a [console.firebase.google.com](https://console.firebase.google.com) y crea un proyecto nuevo.
2. En el menú lateral entra a **Build > Authentication** → pestaña **Sign-in method** → habilita **Correo electrónico/contraseña**.
3. Entra a **Build > Firestore Database** → **Crear base de datos** → empieza en modo producción (ya tenemos las reglas listas en `firestore.rules`).
4. Ve a **Configuración del proyecto** (ícono de engranaje) → baja hasta "Tus apps" → click en el ícono `</>` para crear una app web.
5. Copia los valores que te da (`apiKey`, `authDomain`, etc.) — los vas a necesitar en el paso 3.
6. Para publicar las reglas de seguridad: instala Firebase CLI (`npm install -g firebase-tools`), corre `firebase login`, luego `firebase init firestore` (elige tu proyecto, usa el archivo `firestore.rules` que ya está aquí), y finalmente `firebase deploy --only firestore:rules`.

## 2. Instalar el proyecto

```bash
npm install
```

## 3. Conectar tus llaves de Firebase

Copia `.env.example` a `.env`:

```bash
cp .env.example .env
```

Y pega ahí los valores que copiaste en el paso 1.5:

```
VITE_FIREBASE_API_KEY=tu_api_key
VITE_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu_proyecto
VITE_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
```

`.env` está en `.gitignore`, así que tus llaves nunca se suben a GitHub.

## 4. Correr en local

```bash
npm run dev
```

Abre `http://localhost:5173`.

## 5. Subir a GitHub y publicarlo automáticamente (sin correrlo en local)

Este proyecto ya trae un workflow de GitHub Actions (`.github/workflows/firebase-deploy.yml`) que construye y publica la app a Firebase Hosting cada vez que haces `git push` a la rama `main`. No necesitas instalar nada en tu computadora ni correr `npm run dev`.

**Paso 1 — Sube el código a GitHub:**

```bash
git init
git add .
git commit -m "Primera versión del chat"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
git push -u origin main
```

**Paso 2 — Habilita Firebase Hosting en tu proyecto (una sola vez, desde la consola de Firebase):**

1. En Firebase Console, ve a **Build > Hosting** → clic en **Comenzar** → sigue el asistente (puedes saltarte los pasos que piden usar la terminal, solo necesitas que Hosting quede "activado" en tu proyecto).

**Paso 3 — Agrega tus "secrets" en GitHub** (así el workflow puede construir la app y conectarse a Firebase sin exponer tus llaves):

En tu repositorio de GitHub: **Settings > Secrets and variables > Actions > New repository secret**. Crea uno por cada uno de estos, con el valor que copiaste de tu `firebaseConfig`:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

Y uno más, `FIREBASE_SERVICE_ACCOUNT`, que necesita una llave especial de Google Cloud:

1. En Firebase Console → ⚙️ **Configuración del proyecto** → pestaña **Cuentas de servicio**
2. Clic en **Generar nueva clave privada** → se descarga un archivo `.json`
3. Abre ese archivo, copia **todo** su contenido
4. Pégalo como el valor del secret `FIREBASE_SERVICE_ACCOUNT` en GitHub

**Paso 4 — Publica:**

Cualquier `git push` a `main` (incluyendo el que ya hiciste, o el siguiente cambio que subas) va a disparar el workflow automáticamente. Puedes ver el progreso en la pestaña **Actions** de tu repo en GitHub. Cuando termine (ícono verde ✓), tu app estará en línea en `https://TU_PROYECTO.web.app`.

> Cada vez que quieras actualizar la app, solo haces `git push` — GitHub Actions se encarga de construirla y publicarla.

## Estructura del proyecto

```
src/
  firebase.js          → conexión a Firebase (usa tus variables de entorno)
  lib/
    auth.js             → registro, login, generación de código único
    friends.js           → solicitudes de amistad
    messages.js          → mensajes en tiempo real
  components/
    AuthScreen.jsx        → registro / login / pantalla de código
    AddFriendModal.jsx    → buscar por código + tarjeta + enviar solicitud
    RequestsPanel.jsx     → solicitudes recibidas (aceptar/rechazar)
    ChatWindow.jsx        → conversación en tiempo real
    Avatar.jsx
  App.jsx                → arma todo junto
firestore.rules          → reglas de seguridad (solo amigos ven sus chats)
```

## Próximos pasos posibles

- Estado "en línea" / "escribiendo..." en tiempo real (Firestore Realtime Presence o Realtime Database).
- Notificaciones push (Firebase Cloud Messaging).
- Fotos de perfil (Firebase Storage).
- Confirmación de mensajes leídos (✓✓).
