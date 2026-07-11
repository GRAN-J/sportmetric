# 002: Express en lugar de NestJS

Fecha: 14-07-2026

## Contexto
Se requería un framework backend para Node.js con buena mantenibilidad, pero con una curva de aprendizaje baja para un equipo universitario, muchos de los cuales ya conocen Express.

## Decisión
Utilizaremos Express con TypeScript, estructurando el proyecto siguiendo Clean Architecture (capas: controllers, services, repositories, mappers) para mantener la organización y escalabilidad, sin la opinión fuerte de NestJS.

## Consecuencias
- Positivas: Mayor familiaridad, más control sobre la estructura, menor sobrecarga inicial.
- Negativas: Más boilerplate inicial, no hay decoradores ni inyección de dependencias automática (se manejará manualmente).
