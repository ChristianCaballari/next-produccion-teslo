# Descripción

## Correr en dev

1. Clonar el repositorio
2. Instalar dependencias `npm install`
3. Crear una copia del `env.template` y renombralo a `.env` y cambiar las variables de entorno
4. Levantar la base de datos `docker compose up -d`
5. Correr las migraciones de Prisma `npx prisma migrate dev`
6. Ejecutar seed `npm run seed`
7. Correr el proyecto `npm run dev`

## Correr en prod
