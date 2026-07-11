# 005: Preparar Docker para el futuro

Fecha: 14-07-2026

## Contexto
Aunque no se utilizará Docker en la etapa de desarrollo inicial, es importante preparar la estructura para que sea fácil de contenerizar en el futuro.

## Decisión
Crearemos placeholders para Dockerfile (frontend y backend) y docker-compose.yml en la carpeta docker/, sin implementarlos completamente aún.

## Consecuencias
- Positivas: Cuando se necesite contenerizar, la estructura ya estará lista.
- Negativas: Archivos adicionales en la estructura, pero sin impacto en el desarrollo actual.
