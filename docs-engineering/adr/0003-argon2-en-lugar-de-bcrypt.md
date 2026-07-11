# 003: Argon2 en lugar de bcrypt

Fecha: 14-07-2026

## Contexto
Se necesita un algoritmo de hash de contraseñas seguro y moderno para la aplicación.

## Decisión
Utilizaremos Argon2 (el ganador del concurso Password Hashing Competition 2015) en lugar de bcrypt.

## Consecuencias
- Positivas: Más resistente a ataques de GPU/ASIC, mejor rendimiento en hardware moderno.
- Negativas: Requiere una dependencia nativa (node-gyp), pero es compatible con la mayoría de entornos.
