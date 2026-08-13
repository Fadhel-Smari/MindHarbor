import "dotenv/config";
import { defineConfig } from "prisma/config";

const databaseUrl = process.env["DATABASE_URL"];

if (!databaseUrl) {
  throw new Error("La variable d'environnement DATABASE_URL est manquante dans le fichier .env !");
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: databaseUrl,
  },
});