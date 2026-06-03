## Contexto del proyecto

SportMetric Academic es una app web (Vite + React + React Router) orientada a consulta guiada de protocolos de medición física/antropométrica.

### Stack

- Vite (build/servidor dev)
- React + React Router (navegación por rutas)
- Tailwind CSS (sistema visual)
- JSON como fuente única de datos para protocolos

### Estructura (carpetas clave)

- `src/pages/Welcome.jsx`: bienvenida.
- `src/pages/Categories.jsx`: categorías.
- `src/pages/ProtocolList.jsx`: listado por categoría.
- `src/pages/ProtocolDetail.jsx`: contenedor del protocolo (secciones internas + navegación).
- `src/pages/protocol/*`: secciones del protocolo.
- `src/services/protocolService.js`: carga/orden de protocolos desde JSON.
- `src/data/protocols/*.json`: contenido de protocolos.
- `extract_xlsx.js`: herramienta para extraer/sincronizar JSON desde `OVA_TRACKER.xlsx` (archivo local; no se versiona en Git).

### Pipeline de datos (Mermaid)

```mermaid
flowchart LR
  X["OVA_TRACKER.xlsx (local)"] -->|node extract_xlsx.js --sync| J["src/data/protocols/*.json"]
  J -->|import.meta.glob (eager)| S["protocolService.js"]
  S --> P["Pantallas (React)"]
  P --> U["UI (secciones del protocolo)"]
```

### Seguridad (resumen)

- No se renderiza HTML “crudo” (no se usa `dangerouslySetInnerHTML`).
- No hay credenciales/keys en el código.
- Placeholders: se usan placeholders embebidos (data URI) para evitar dependencias externas y bloqueos del navegador.
- Dependencias:
  - `xlsx` se usa solo para extracción local (tooling). No participa en runtime de producción.
