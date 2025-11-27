# 🧟 LastDayCraft - Zombie Survival Server Website

Bienvenido al repositorio del sitio web oficial de **LastDayCraft**, un servidor de Minecraft enfocado en la supervivencia zombie extrema.

Este proyecto es una landing page moderna y atmosférica diseñada para guiar a los jugadores en la instalación del modpack, mostrar características destacadas y ofrecer recursos útiles.

## ✨ Características del Sitio

- **Diseño Atmosférico**: Estética oscura y temática de supervivencia con efectos visuales inmersivos.
- **Reproductor de Audio**: Música de fondo y efectos de sonido para mejorar la experiencia (con controles de usuario).
- **Animaciones Premium**:
  - Logo flotante con física suave.
  - Efectos de "glitch" en títulos.
  - Partículas ambientales brillantes.
  - Navegación con efecto de "respiración".
  - Micro-interacciones y efectos de hover en todos los elementos.
- **Optimización**: Carga rápida y animaciones fluidas (60fps).
- **Responsive**: Totalmente adaptado para móviles, tablets y escritorio.

## 🛠️ Mejoras Recientes

Se ha realizado una actualización completa del sitio con las siguientes mejoras:

### 🎨 Visual y UI
- **Favicon Personalizado**: Se integró el logo del servidor como icono del navegador.
- **Navegación Mejorada**: Corrección de estilos en los enlaces del menú y nuevos efectos de hover.
- **Efectos Visuales**: Implementación de brillo (glow), escalas dinámicas y sombras en botones y tarjetas.
- **Feedback Interactivo**: Efecto "ripple" al hacer clic en botones y sonidos de hover sutiles.

### ⚡ Rendimiento y Funcionalidad
- **Carga Optimizada**: Reducción del tiempo de la pantalla de carga en un 40% (de 5.5s a ~3.3s).
- **Corrección de Audio**: Solución a problemas de rutas de archivos para asegurar la reproducción correcta de música y efectos.
- **Estabilidad**: Eliminación de efectos de scroll que causaban conflictos visuales, manteniendo la suavidad de la navegación.

## 🚀 Instalación y Despliegue

Este sitio es estático (HTML, CSS, JS), por lo que es muy fácil de desplegar.

### GitHub Pages (Recomendado)
1. Ve a la pestaña **Settings** de este repositorio.
2. Entra en la sección **Pages**.
3. En **Source**, selecciona la rama `main` y la carpeta `/ (root)`.
4. Guarda los cambios. ¡Tu sitio estará online en minutos!

## 📂 Estructura del Proyecto

- `index.html`: Estructura principal y contenido.
- `styles.css`: Estilos, variables de diseño y animaciones.
- `script.js`: Lógica de la pantalla de carga, reproductor de audio y efectos interactivos.
- `audio/`: Archivos de sonido y música de fondo.
- `logo-lastdaycraft.png`: Recursos gráficos.

## 🔌 Integración con Exaroton (Estado y Métricas)

Si quieres mostrar el estado del servidor y métricas (jugadores conectados, RAM asignada), **no expongas tu token** en el cliente. Usa el proxy incluido en `api-proxy/`.

Pasos rápidos:
1. Copia `api-proxy/.env.example` a `api-proxy/.env` y rellena `EXAROTON_TOKEN` (tu token de exaroton) y `PROXY_KEY`.
2. Desde `api-proxy/` instala dependencias: `npm install` y luego `npm start`. El servidor escuchará por defecto en 3001.
3. En tu HTML (`index.html`), busca el panel de estado y introduce tu `server id` (el ServerID que aparece en la API o en el panel de exaroton) en el atributo `data-server` del elemento `.server-panel`.
  - Si tu proxy no está servido en la misma origen de tu HTML (por ejemplo `http://localhost:3001`), añade `data-api="http://localhost:3001/api"` al elemento `.server-panel`.
4. Abre la web local y el panel de estado consultará `/api/servers/:id` a través del proxy para leer estado y jugadores; la RAM asignada se consulta desde `/api/servers/:id/options/ram/`.

Notas:
- El panel de métricas muestra `RAM asignada` (opción) y el `uso de memoria` o `tick` solo si usas websockets (recomendado); el proxy puede ser extendido para reemitir eventos websocket desde exaroton a tu cliente.
- Opciones administrativas (like Start/Stop) requieren enviar el header `x-proxy-key` con el valor definido en tu `.env`.


---
*Desarrollado para la comunidad de LastDayCraft.*
