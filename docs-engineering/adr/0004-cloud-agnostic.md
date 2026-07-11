# 004: Arquitectura Cloud Agnostic

Fecha: 14-07-2026

## Contexto
La universidad aún no ha definido el proveedor cloud definitivo para la aplicación, por lo que es crucial que la arquitectura no dependa de ningún proveedor específico.

## Decisión
Todo el código y la configuración estarán diseñados para funcionar en cualquier proveedor cloud (AWS, Azure, GCP, Vercel, Render, Railway, etc.) utilizando solo variables de entorno y contenedores Docker preparados para el futuro. La base de datos será PostgreSQL, compatible con casi todos los proveedores.

## Consecuencias
- Positivas: Flexibilidad total para cambiar de proveedor sin modificar código, futuro asegurado.
- Negativas: No se pueden utilizar servicios específicos de un proveedor (ej: AWS Lambda, Vercel Edge Functions) sin encapsularlos.
