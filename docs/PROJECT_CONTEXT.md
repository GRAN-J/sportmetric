## Contexto del proyecto

SportMetric Academic es una app web (Vite + React + React Router) orientada a consulta guiada de protocolos de medición física/antropométrica.

### Stack

- Vite (compilación y servidor de desarrollo)
- React + React Router (navegación por rutas)
- Tailwind CSS (sistema visual)
- JSON como fuente principal de datos para protocolos
- Framer Motion para transiciones y retroalimentación visual
- Lucide React para iconografía

### Estructura (carpetas clave)

- `src/pages/Welcome.jsx`: bienvenida.
- `src/pages/Categories.jsx`: categorías.
- `src/pages/ProtocolList.jsx`: listado por categoría.
- `src/pages/ProtocolDetail.jsx`: contenedor del protocolo (secciones internas + navegación).
- `src/pages/protocol/*`: secciones del protocolo.
- `src/services/protocolService.js`: carga/orden de protocolos desde JSON.
- `src/data/protocols/*.json`: contenido de protocolos.
- `src/App.jsx`: definición de rutas principales con carga diferida (`lazy`) para reducir el peso inicial.
- `public/assets/logos`, `public/assets/images` y `public/assets/videos`: ubicación de logos, imágenes y videos reales.
- `extract_xlsx.js`: herramienta para extraer/sincronizar JSON desde `OVA_TRACKER.xlsx` (archivo local; no se versiona en Git).

### Pipeline de datos (Mermaid)

```mermaid
flowchart LR
  A["OVA_TRACKER.xlsx (local)"] --> B["extract_xlsx.js"]
  B --> C["Archivos JSON de protocolos"]
  C --> D["protocolService.js"]
  D --> E["Pantallas React"]
  E --> F["Interfaz de usuario"]
```

### Seguridad (resumen)

- No se renderiza HTML “crudo” (no se usa `dangerouslySetInnerHTML`).
- No hay credenciales/keys en el código.
- Placeholders: se usan recursos embebidos (`data URI`) y assets locales para evitar dependencias externas y bloqueos del navegador.
- Dependencias:
  - `xlsx` se usa solo para extracción local como herramienta de apoyo. No participa en la ejecución de producción.

### Comportamiento de la interfaz

- La aplicación está pensada con enfoque mobile-first.
- La navegación inferior se oculta automáticamente al entrar a un protocolo y también al hacer scroll hacia abajo, para liberar espacio útil en pantallas pequeñas.
- Los protocolos incluyen acciones explícitas de navegación para mejorar la accesibilidad, especialmente en usuarios que no dependen bien de iconos.

### Repositorio y despliegue

- La rama `main` se reserva para producción.
- La rama `dev` se usa para desarrollo e integración de cambios.
- `OVA_TRACKER.xlsx` no se incluye en Git; solo se conserva el resultado final en JSON dentro de `src/data/protocols/`.
