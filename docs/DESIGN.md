---
name: SportMetric Academic
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#44474c'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#75777d'
  outline-variant: '#c5c6cd'
  surface-tint: '#515f74'
  primary: '#071629'
  on-primary: '#ffffff'
  primary-container: '#1d2b3e'
  on-primary-container: '#8492a9'
  inverse-primary: '#b9c7e0'
  secondary: '#006b5f'
  on-secondary: '#ffffff'
  secondary-container: '#9cefdf'
  on-secondary-container: '#0b6f63'
  tertiary: '#280f00'
  on-tertiary: '#ffffff'
  tertiary-container: '#462000'
  on-tertiary-container: '#da7823'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d5e3fd'
  primary-fixed-dim: '#b9c7e0'
  on-primary-fixed: '#0d1c2e'
  on-primary-fixed-variant: '#3a485c'
  secondary-fixed: '#9ff2e2'
  secondary-fixed-dim: '#83d5c6'
  on-secondary-fixed: '#00201c'
  on-secondary-fixed-variant: '#005047'
  tertiary-fixed: '#ffdcc5'
  tertiary-fixed-dim: '#ffb783'
  on-tertiary-fixed: '#301400'
  on-tertiary-fixed-variant: '#713700'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
  teal-accent: '#2dd4bf'
  outline-subtle: '#c5c6cd'
typography:
  display-lg:
    fontFamily: Manrope
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Manrope
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Manrope
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Manrope
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Manrope
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Manrope
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Manrope
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Manrope
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 14px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 8px
  sm: 16px
  gutter: 20px
  md: 24px
  lg: 40px
  xl: 64px
  container-max: 1200px
---

## Marca y estilo

SportMetric Academic adopta una estetica "academica minimalista". Busca equilibrar el rigor tecnico de las ciencias del deporte con una experiencia educativa moderna, clara y cercana. La personalidad visual de la marca es precisa, confiable y limpia, con suficiente espacio en blanco para reducir la carga cognitiva durante la consulta de informacion tecnica.

El estilo visual se acerca a una linea corporativa moderna con un matiz minimalista suave: sombras sutiles, contornos delgados y una paleta profesional basada en azules y verdes. El objetivo es transmitir confianza, orden y claridad sin que la interfaz se sienta pesada, especialmente en movil.

## Colores

La paleta se apoya en **Deep Navy (#1d2b3e)** para la jerarquia principal y en **Teal Primario (#006b5f)** como color de estabilidad visual. El **Teal Secundario (#2dd4bf)** funciona como color de accion y se usa en indicadores de progreso, estados activos y llamadas principales a la accion.

El **Academic Orange (#fb923c)** se reserva como acento terciario para contenido teorico, alertas o elementos de alta prioridad. El sistema de fondo utiliza un gris frio muy claro (**#f8fafc**) para mantener una sensacion limpia, cercana a un entorno de laboratorio, mientras que las superficies blancas ayudan a destacar las tarjetas y contenedores.

## Tipografia

**Manrope** es la tipografia principal del sistema. Se eligio por su claridad geometrica y su buena legibilidad en contextos tecnicos y academicos.

- **Titulos y encabezados:** usan pesos altos (Bold y ExtraBold) y un espaciado ligeramente mas cerrado para lograr una presencia moderna.
- **Texto base:** parte de 16px para facilitar la lectura en pantallas pequenas y medianas.
- **Etiquetas:** usan peso SemiBold y, cuando estan en mayusculas, pueden aumentar el espaciado entre letras para reforzar categorias o nomenclaturas tecnicas.
- **Ajuste en movil:** los encabezados superiores a 32px deben reducir su escala en dispositivos pequenos para evitar saltos excesivos de linea.

## Distribucion y espaciado

El sistema sigue una logica de contenedor centrado en escritorio, con un ancho maximo de `1200px`.

- **Cuadricula:** el contenido principal puede organizarse sobre una cuadricula de 12 columnas en escritorio.
- **Margenes:** se mantiene un relleno horizontal de 20px en todas las pantallas.
- **Ritmo vertical:** el espaciado sigue una escala progresiva (`16`, `24`, `40`, `64`) para separar bloques de informacion con claridad.
- **Movil:** la interfaz colapsa a una sola columna. La prioridad es mostrar el contenido central antes que los elementos de navegacion persistentes.

## Elevacion y profundidad

La sensacion de profundidad se consigue mediante capas tonales y sombras ambientales suaves.

1. **Fondo base:** el fondo general ocupa el nivel mas bajo (`#f8fafc`).
2. **Tarjetas:** los contenedores principales usan fondo blanco y una sombra suave tipo tarjeta: `0px 4px 20px rgba(51, 65, 85, 0.05)`.
3. **Bordes:** la mayoria de contenedores incorpora un borde sutil de `1px` en `#c5c6cd` para definir mejor los limites, incluso en pantallas con mucho brillo.
4. **Interaccion:** los estados activos de botones pueden usar un pequeno `translateY(2px)` para simular una pulsacion fisica.

## Formas

El lenguaje de formas es redondeado. Esto ayuda a que la interfaz se sienta moderna, amable y menos rigida frente a la naturaleza tecnica del contenido.

- **Elementos estandar:** botones y campos pequenos usan un radio de `0.5rem` (8px).
- **Contenedores:** tarjetas y secciones principales usan `0.75rem` (12px) para un marco mas suave.
- **Elementos destacados:** las acciones principales pueden llegar a `1rem` (16px) o a un estilo tipo pildora para reforzar su importancia.
- **Iconos:** cuando aparecen dentro de elementos de navegacion o categoria, pueden ir sobre fondos redondeados para mejorar reconocimiento visual.

## Componentes

### Botones
- **Primario:** fondo Teal Secundario (`#2dd4bf`), texto blanco y forma redondeada. Puede incluir sombra o realce al pasar el cursor.
- **Secundario:** fondo transparente, borde visible en azul principal y texto oscuro.
- **Invertido:** fondo azul principal y texto blanco.
- **Accesibilidad:** siempre que sea posible, las acciones importantes deben incluir texto explicito y no depender solo del icono.

### Campos de entrada
- **Barra de busqueda:** fondo blanco, borde de `1.5px` en `#c5c6cd` e iconos integrados dentro del area izquierda. En foco, el borde puede cambiar a Teal Secundario.

### Tarjetas
- **Tarjeta estandar:** fondo blanco, radio de 12px, borde de 1px y sombra ambiental suave.
- **Tarjeta destacada:** puede incorporar una franja superior de 4px en color secundario o terciario para distinguir tipos de contenido.

### Navegacion
- **Encabezado:** debe mantenerse compacto y claro, especialmente en iPhone y Safari.
- **Navegacion inferior:** esta pensada para movil. Se oculta automaticamente dentro de los protocolos y al hacer scroll hacia abajo para ganar espacio util.
- **Estados activos:** deben tener suficiente contraste y ser faciles de reconocer de un vistazo.
- **Protocolos:** dentro del flujo del protocolo se priorizan botones con texto como `Anterior`, `Siguiente` o `Volver a categorias`.

### Indicadores de progreso
- Las barras lineales usan una pista con baja opacidad y un relleno solido en el color de accion.
- Los extremos redondeados ayudan a que el componente se vea consistente con el resto del sistema.
