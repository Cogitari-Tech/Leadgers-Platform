import { Client } from "pg";

async function seed() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("Missing DATABASE_URL environment variable.");
  }

  const client = new Client({
    connectionString,
  });

  await client.connect();

  const tenantId = "a7645451-4321-4b8b-bc55-5251639939b2";
  const userId = "69fc7475-5047-47ce-ac0b-8fbdccbf7bb3";

  console.log(`🚀 Seeding Stress Audit Program for user teste@leadgers.com...`);

  const programRes = await client.query(
    `
        INSERT INTO audit_programs (id, tenant_id, name, status, frequency, created_by, created_at, updated_at)
        VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, now(), now())
        RETURNING id
    `,
    [tenantId, "Stress Test Audit 200 Findings", "draft", "annual", userId],
  );

  const programId = programRes.rows[0].id;
  console.log(`Program ID: ${programId}`);
  console.log(`📦 Inserting 200 findings...`);

  const risks = ["low", "medium", "high", "critical"];
  const statuses = ["open", "in_progress", "resolved"];

  for (let i = 1; i <= 200; i++) {
    const risk = risks[i % 4];
    const status = statuses[i % 3];

    await client.query(
      `
            INSERT INTO audit_findings (id, program_id, title, description, risk_level, status, created_by, created_at)
            VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, now())
        `,
      [
        programId,
        `Finding Stress #${i}`,
        `Detailed description for stress test finding number ${i}. Testing system resilience and report generation performance with large datasets. User: teste@leadgers.com.`,
        risk,
        status,
        userId,
      ],
    );

    if (i % 50 === 0) console.log(`   - ${i} findings inserted...`);
  }

  console.log(`✅ Finished seeding stress data.`);
  console.log(`Program ID for manual test: ${programId}`);
  await client.end();
}

seed().catch(console.error);
