# Guia de Assets Visuales - SportMetric Academic

Este directorio guarda todos los archivos visuales (logos, imagenes, 
videos, mascota, previews de redes) que usa la app. La convencion esta 
pensada para que cualquier persona pueda agregar o reemplazar un asset 
sin tocar codigo: solo se sube el archivo al lugar esperado con el 
nombre y extension correctos y se ve automaticamente.

## Regla de oro

> Si para cambiar una imagen, video o icono necesitas modificar un 
> archivo `.json` o `.jsx`, algo esta mal. Todos los assets visuales 
> estan referenciados por rutas (`/assets/...`) y basta con subir el 
> archivo al directorio esperado.

## Estructura de carpetas

```
frontend/public/assets/
|-- logos/         Identidad de marca (header, favicon, apple-touch)
|-- videos/        Videos de pasos por protocolo
|-- placeholders/  Imagenes de materiales por protocolo
|-- mascota/       Mascota de la app (placeholder SVG hasta subir real)
|-- og/            Preview para Open Graph (compartir en redes)
|-- general/       Banners, ilustraciones y assets globales libres
`-- README.md      Este archivo
```

Las rutas publicas equivalentes son:
- `frontend/public/assets/logos/foo.svg` -> `https://app/assets/logos/foo.svg`
- `frontend/public/assets/videos/bar.mp4` -> `https://app/assets/videos/bar.mp4`
- (idem para el resto)

## Extensiones soportadas

| Tipo de asset | Extensiones aceptadas | Recomendada | Notas |
|---|---|---|---|
| Logos (header, favicon) | `.svg`, `.png` | `.svg` | SVG escala sin pixelarse |
| Apple touch icon | `.png` | `.png` | iOS no soporta SVG en este meta |
| Mascota | `.png`, `.jpg`, `.webp`, `.svg` | `.png` | Default en codigo: `.png` |
| Imagen de material | `.webp`, `.png`, `.jpg` | `.webp` | WebP pesa ~30% menos que PNG/JPG |
| Video de paso | `.mp4`, `.webm` | `.mp4` | Compatibilidad maxima |
| OG image | `.png`, `.jpg` | `.png` | Tamano recomendado: 1200x630 px |
| General (banners) | cualquier formato web estandar | `.webp` o `.svg` | - |

Si necesitas cambiar la extension por default de la mascota (hoy es 
`.png`), edita la constante `MASCOT_PATH` en 
`frontend/src/pages/Welcome.jsx`.

## Convencion de nombres

Todos los nombres de archivo van en **kebab-case** (minusculas, palabras 
separadas por guion, sin tildes ni espacios, sin caracteres especiales).

| Tipo | Formato | Ejemplo |
|---|---|---|
| Logo principal | `logo-principal` | `logo-principal.svg` |
| Logo secundario / favicon | `logo-secundario` | `logo-secundario.svg` |
| Apple touch icon | `apple-touch-icon` | `apple-touch-icon.png` |
| Mascota | `mascota-principal` | `mascota-principal.png` |
| Imagen de material | slug del material | `tallimetro.webp`, `cinta-metrica.webp` |
| Video de paso | `<id-protocolo>-paso-<n>` | `medicion-de-la-talla-paso-1.mp4` |
| OG image | `og-image` | `og-image.png` |

El **id de protocolo** usado en los nombres de video es el mismo que el 
campo `id` del JSON del protocolo. Por ejemplo, el protocolo 
`test-de-flexibilidad-del-hombro-fms` usa videos 
`test-de-flexibilidad-del-hombro-fms-paso-1.mp4`, 
`...-paso-2.mp4`, etc.

## Como cambiar cada tipo de asset

### Cambiar el logo del header

Reemplaza el archivo:
```
frontend/public/assets/logos/logo-principal.svg
```
El nuevo archivo debe estar en formato SVG (preferentemente) o PNG y 
mantener el mismo nombre. La app lo mostrara automaticamente en la 
pantalla de bienvenida y en el header de las paginas autenticadas.

Si cambias la extension (por ejemplo a `.png`), actualiza las 
referencias en:
- `frontend/src/pages/Welcome.jsx` (linea del `src=...`)
- `frontend/src/components/navigation/Header.jsx` (linea del `src=...`)

### Cambiar el favicon

Reemplaza el archivo:
```
frontend/public/assets/logos/logo-secundario.svg
```
Si necesitas cambiar a PNG, reemplaza el link en `frontend/index.html`:
```html
<link rel="icon" type="image/png" href="/assets/logos/logo-secundario.png" />
```

### Cambiar el apple-touch-icon

Sube el archivo (180x180 px recomendado) a:
```
frontend/public/assets/logos/apple-touch-icon.png
```
La referencia en `frontend/index.html` ya esta lista.

### Cambiar la mascota

Sube el archivo con el nombre exacto a:
```
frontend/public/assets/mascota/mascota-principal.png
```
La app lo detecta automaticamente. Mientras el archivo no exista, se 
muestra el placeholder SVG actual. No hace falta tocar codigo.

Si la imagen real usa otra extension, edita la constante `MASCOT_PATH` 
en `frontend/src/pages/Welcome.jsx` (por ejemplo a `.webp` o `.svg`) 
y sube el archivo con esa extension.

### Cambiar la imagen de un material

Cada protocolo declara sus materiales en su JSON. Por ejemplo, 
`frontend/src/data/protocols/medicion-de-la-talla.json` tiene:
```json
"materials": [
  { "name": "Tallimetro", "image": "/assets/placeholders/tallimetro.webp" }
]
```

Para mostrar la imagen real, sube el archivo a la ruta exacta que 
aparece en el JSON:
```
frontend/public/assets/placeholders/tallimetro.webp
```
El archivo debe llamarse `tallimetro.webp` (mismo nombre y extension 
que el JSON). Mientras el archivo no exista, el navegador mostrara el 
icono de imagen rota.

### Cambiar el video de un paso

Igual que las imagenes de materiales. Sube el archivo a:
```
frontend/public/assets/videos/<id-protocolo>-paso-<n>.mp4
```
Por ejemplo, para cambiar el video del paso 3 de la toma de peso:
```
frontend/public/assets/videos/medicion-del-peso-paso-3.mp4
```

Para **agregar un paso nuevo** (por ejemplo, paso 8 a un protocolo 
que tiene 7):
1. Sube el video a `frontend/public/assets/videos/<id>-paso-8.mp4`.
2. Edita el JSON del protocolo y agrega el nuevo objeto paso en el 
   array `steps`:
   ```json
   { "step": 8, "title": "Paso 8", "description": "...", "video": "/assets/videos/<id>-paso-8.mp4" }
   ```

### Cambiar el icono de una categoria

Edita el archivo:
```
frontend/src/data/categories.json
```
El campo `icon` acepta cualquier nombre de icono de la libreria 
[lucide-react](https://lucide.dev) (por ejemplo `"Heart"`, `"Zap"`, 
`"Bike"`). El campo `color` acepta cualquier clase de Tailwind.

No hace falta subir archivos: los iconos son componentes React, no 
archivos.

### Cambiar el preview al compartir en redes (OG image)

Sube una imagen de 1200x630 px a:
```
frontend/public/assets/og/og-image.png
```
Los meta tags en `frontend/index.html` (og:image, twitter:image) ya 
estan listos y apuntando a esa ruta. Mientras no subas el archivo, 
las redes usan un placeholder vacio.

## Inventario de archivos esperados

### Logos (carpeta `logos/`)
| Archivo | Estado | Notas |
|---|---|---|
| `logo-principal.svg` | Existe | Header y pantalla de bienvenida |
| `logo-secundario.svg` | Existe | Favicon |
| `apple-touch-icon.png` | **Falta subir** | 180x180 px recomendado |

### Mascota (carpeta `mascota/`)
| Archivo | Estado | Notas |
|---|---|---|
| `mascota-principal.png` | **Falta subir** | Default en codigo: `.png` |

### OG image (carpeta `og/`)
| Archivo | Estado | Notas |
|---|---|---|
| `og-image.png` | **Falta subir** | 1200x630 px recomendado |

### Imagenes de materiales (carpeta `placeholders/`)
Todos referenciados en los JSON de cada protocolo. **Ninguno existe 
todavia fisicamente**; hay que subirlos. Lista completa de archivos 
esperados:

| Archivo (kebab-case) | Usado en protocolo(s) |
|---|---|
| `balon-medicinal-de-10lbs-para-hombres-y-8lbs-para-mujeres.webp` | test-potencia-brazos-balon-medicinal |
| `banco-de-apoyo.webp` | test-detent-sargent |
| `bascula-seca-mbca-514.webp` | medicion-del-peso |
| `biombo.webp` | medicion-perimetro-cintura |
| `cartulina-negra.webp` | test-detent-sargent |
| `cinta-metrica-de-bloqueo-automatico-o-retractil-ver-imagen-5.webp` | medicion-perimetro-cintura |
| `cinta-metrica-para-marcar-la-distancia-de-20-metros.webp` | medicion-resistencia-cardiorrespiratoria |
| `cinta-metrica.webp` | test-detent-sargent, test-potencia-brazos-balon-medicinal, test-flexibilidad-hombro-fms |
| `colchoneta.webp` | test-potencia-brazos-balon-medicinal, test-movilidad-articular-inclinometro |
| `colchonetas.webp` | test-resistencia-muscular-plancha-isometrica |
| `conos-para-delimitar-los-extremos-de-la-distancia.webp` | medicion-resistencia-cardiorrespiratoria |
| `cronometro.webp` | test-resistencia-muscular-plancha-isometrica |
| `escuadra.webp` | medicion-de-la-talla |
| `formato-de-recoleccion-de-datos.webp` | medicion-resistencia-cardiorrespiratoria, test-movilidad-articular-inclinometro |
| `formato-de-registro-de-datos.webp` | medicion-de-la-talla, medicion-perimetro-cintura, medicion-del-peso, test-detent-sargent, test-potencia-brazos-balon-medicinal, test-flexibilidad-hombro-fms, test-resistencia-muscular-plancha-isometrica |
| `inclinometro-ver-imagen-17.webp` | test-movilidad-articular-inclinometro |
| `marcador-borrable.webp` | medicion-perimetro-cintura |
| `marcador-demografico-tiza-o-cinta-adhesiva-para-senalar-referencias-anatomicas.webp` | test-movilidad-articular-inclinometro |
| `pared-vertical-con-superficie-plana.webp` | test-detent-sargent |
| `planillero.webp` | varios (compartido) |
| `reproductor-de-sonido-mp3-ver-siguiente-pagina.webp` | medicion-resistencia-cardiorrespiratoria |
| `silbato.webp` | medicion-resistencia-cardiorrespiratoria |
| `superficie-antideslizante.webp` | test-potencia-brazos-balon-medicinal |
| `superficie-plana-de-al-menos-20-metros-de-largo.webp` | medicion-resistencia-cardiorrespiratoria |
| `superficie-plana-y-antideslizante.webp` | test-resistencia-muscular-plancha-isometrica |
| `superficie-plana-y-firme.webp` | test-movilidad-articular-inclinometro |
| `superficie-plana-y-rigida.webp` | medicion-de-la-talla |
| `tallimetro.webp` | medicion-de-la-talla |
| `tiza.webp` | test-detent-sargent, test-potencia-brazos-balon-medicinal |
| `baston-de-medicion-fms-ver-imagen-12-a.webp` | test-flexibilidad-hombro-fms |

### Videos de pasos (carpeta `videos/`)
Convención: `<id-protocolo>-paso-<n>.mp4`. Hay 9 protocolos y los 
videos ya están parcialmente subidos. La lista exacta por protocolo 
esta en cada JSON bajo el array `steps[].video`. Mientras un video no 
exista, el reproductor mostrara el error nativo del navegador.

> **Nota historica**: hasta hace poco existia un duplicado del video 
> `medicion-de-la-talla-paso-1.mp4` en la carpeta `placeholders/`. Ya 
> fue eliminado.

## Procedimiento para agregar un asset nuevo

1. Identifica que tipo de asset es (logo, material, video, etc.).
2. Mira esta guia para saber la carpeta y convencion de nombre.
3. Si es un asset referenciado en un JSON, asegurate de que el nombre 
   del archivo coincida exactamente con el valor del campo `image` o 
   `video` en el JSON.
4. Sube el archivo a la ruta esperada.
5. (Opcional) Si quieres verificar que la app lo ve, abre la pantalla 
   correspondiente en la version desplegada.

## Procedimiento para renombrar o reubicar

Si necesitas **cambiar el nombre o la ruta** de un asset (por ejemplo, 
porque estas reorganizando la estructura), actualiza tambien la 
referencia en el JSON o en el componente que la usa. Las referencias 
estan en:

- **JSONs de protocolos** (`frontend/src/data/protocols/*.json`): 
  campos `materials[].image` y `steps[].video`.
- **`frontend/src/pages/Welcome.jsx`**: linea del logo principal y la 
  constante `MASCOT_PATH` arriba del componente.
- **`frontend/src/components/navigation/Header.jsx`**: linea del 
  logo principal.
- **`frontend/index.html`**: favicon, apple-touch-icon, og:image, 
  twitter:image.

## Notas operativas

- **Tamano maximo recomendado por archivo**: 10 MB. Si un video es 
  mas grande, considera comprimirlo con `ffmpeg -i input.mp4 -crf 28 
  output.mp4`.
- **Peso total objetivo**: mantener el bundle de assets por debajo de 
  200 MB. Videos muy pesados pueden afectar la primera carga.
- **Cache del navegador**: Vercel sirve los assets con cache de un 
  ano (`Cache-Control: public, max-age=31536000, immutable`). Si 
  reemplazas un archivo, los navegadores pueden mostrar la version 
  vieja hasta que el usuario haga un hard refresh (Ctrl+Shift+R).
