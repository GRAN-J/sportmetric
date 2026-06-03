## Estructura de un protocolo (JSON)

Los protocolos viven en `src/data/protocols/*.json`. La app carga automáticamente solo los JSON “oficiales” que incluyen `order` numérico.

### Campos

- `id` (string): identificador único (slug).
- `order` (number): orden global de renderizado.
- `category` (string): id de categoría (debe existir en `src/data/categories.js`).
- `title` (string): nombre visible.
- `objective` (string): objetivo del protocolo.
- `materials` (array): lista de materiales.
  - item: `{ "name": string, "image"?: string }`
- `description` (string): descripción general.
- `checklist` (array): lista de chequeo (strings).
- `steps` (array): pasos.
  - item: `{ "step": number, "title": string, "description": string, "video"?: string }`
- `interruptionCriteria` (array): criterios de interrupción (strings).
- `dataRegistry` (object): metadatos para el registro de datos.
  - ejemplo: `{ "title": "Registro de datos", "description": "...", "unit"?: "kg|cm|m|s|°|etapa" }`

### Reglas de renderizado

- Materiales, checklist, pasos, criterios y registro son opcionales.
- Si un campo opcional está vacío (array vacío u objeto vacío), su sección no se muestra.
- Texto se renderiza como texto plano (sin HTML).

### Diagrama (Mermaid)

```mermaid
classDiagram
  class Protocol {
    +string id
    +number order
    +string category
    +string title
    +string objective
    +Material[] materials
    +string description
    +string[] checklist
    +Step[] steps
    +string[] interruptionCriteria
    +DataRegistry dataRegistry
  }

  class Material {
    +string name
    +string image
  }

  class Step {
    +number step
    +string title
    +string description
    +string video
  }

  class DataRegistry {
    +string title
    +string description
    +string unit
  }

  Protocol "1" o-- "0..*" Material
  Protocol "1" o-- "0..*" Step
  Protocol "1" o-- "1" DataRegistry
```
