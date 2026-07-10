# 001: Monorepo Simple

Fecha: 14-07-2026

## Contexto
Necesitamos una estructura de proyecto que sea fácil de mantener para un proyecto universitario, que permita desarrollar frontend y backend juntos sin la complejidad de herramientas avanzadas de monorepo en una etapa inicial.

## Decisión
Utilizaremos un monorepo simple con carpetas separadas para frontend y backend, sin herramientas como Turborepo o Lerna en esta etapa inicial. La estructura estará preparada para agregar estas herramientas en el futuro si el proyecto crece.

## Consecuencias
- Positivas: Facilidad de uso, menos dependencias, menor curva de aprendizaje para nuevos colaboradores.
- Negativas: No hay deduplicación de dependencias automática, scripts separados para cada parte del proyecto.
