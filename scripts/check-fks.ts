import { prisma } from "../apps/api/src/config/prisma";

type ForeignKeyRow = {
  table_schema: string;
  table_name: string;
  column_name: string;
};

async function findFKs() {
  console.log("🔍 Buscando Foreign Keys que apontam para auth.users...");

  // Query to find all foreign keys pointing to auth.users
  const fks = await prisma.$queryRaw<ForeignKeyRow[]>`
    SELECT
      tc.table_schema,
      tc.table_name,
      kcu.column_name,
      ccu.table_schema AS foreign_table_schema,
      ccu.table_name AS foreign_table_name,
      ccu.column_name AS foreign_column_name
    FROM
      information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
    WHERE
      tc.constraint_type = 'FOREIGN KEY'
      AND ccu.table_name = 'users'
      AND ccu.table_schema = 'auth';
  `;

  console.log("📋 Tabelas com FK para auth.users:");
  fks.forEach((fk) => {
    console.log(` - ${fk.table_schema}.${fk.table_name} (${fk.column_name})`);
  });
}

findFKs()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
