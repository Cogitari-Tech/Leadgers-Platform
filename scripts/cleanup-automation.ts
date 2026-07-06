import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";

// Function to perform cleanup on a specific project
async function cleanupProject(name: string, url: string, key: string) {
  console.log(`\n🚀 INICIANDO LIMPEZA: Ambiente [${name}]`);
  console.log(`📍 URL: ${url}`);

  const supabase = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const TEST_EMAIL = "teste@leadgers.com";

  // 1. Tabelas Base (Prisma)
  const businessTables = [
    "transactions",
    "roadmap_items",
    "key_results",
    "cap_table_shareholders",
    "data_room_documents",
    "investor_updates",
    "mrr_snapshots",
    "sales_opportunities",
    "headcount_plans",
    "business_model_canvas",
    "north_star_metrics",
    "health_scores",
    "accounts",
    "objectives",
    "milestones",
    "cap_table_rounds",
  ];

  // 2. Diagnóstico de Tabelas Extras (Profiles, etc)
  console.log(`🔍 Diagnosticando tabelas extras...`);
  const extraTables = [
    "profiles",
    "notifications",
    "user_settings",
    "audit_log",
    "invites",
  ];
  const tablesToClean = [...businessTables];

  for (const table of extraTables) {
    const { error } = await supabase
      .from(table)
      .select("count", { count: "exact", head: true });
    if (!error) {
      console.log(`    📍 Tabela extra detectada: ${table}`);
      tablesToClean.push(table);
    }
  }

  // 3. Encontrar o usuário de teste
  console.log(`🔍 Buscando usuário de teste: ${TEST_EMAIL}...`);
  const {
    data: { users },
    error: listError,
  } = await supabase.auth.admin.listUsers();

  if (listError) {
    console.error(`  🔴 Erro ao listar usuários:`, listError);
    return;
  }

  const testUser = users.find((u: any) => u.email === TEST_EMAIL);
  if (!testUser) {
    console.warn(
      `  ⚠️ Usuário de teste ${TEST_EMAIL} não encontrado! Nada será preservado.`,
    );
  }

  // 4. Identificar tenants a serem preservados
  const preservedTenants = new Set<string>();
  if (testUser) {
    const { data: testMemberships } = await supabase
      .from("tenant_members")
      .select("tenant_id")
      .eq("user_id", testUser.id);

    testMemberships?.forEach((m: any) => preservedTenants.add(m.tenant_id));
    console.log(
      `  🛡️ Tenants preservados: [${Array.from(preservedTenants).join(", ")}]`,
    );
  }

  // 5. Obter alvos de remoção
  const usersToDelete = users.filter(
    (u: any) => u.email !== TEST_EMAIL && u.email !== "teste@cogitari.com",
  );
  const { data: allTenants } = await supabase.from("tenants").select("id");
  const tenantsToDelete = (allTenants || [])
    .map((t: any) => t.id)
    .filter((id) => !preservedTenants.has(id));

  console.log(`  👥 Usuários para remover: ${usersToDelete.length}`);
  console.log(`  🏢 Tenants para limpar: ${tenantsToDelete.length}`);

  // 6. Executar Limpeza de Dados (Por Tenant)
  if (tenantsToDelete.length > 0) {
    for (const table of tablesToClean) {
      console.log(`    🧹 Limpando [${table}]...`);
      const { error } = await supabase
        .from(table)
        .delete()
        .in("tenant_id", tenantsToDelete);
      if (
        error &&
        !error.message.includes('column "tenant_id" does not exist')
      ) {
        // Se a tabela não tem tenant_id (ex: profiles), tentaremos limpar por user_id depois
      }
    }
  }

  // 7. Limpeza por User ID (Tabelas que não tem ON DELETE CASCADE no Auth)
  const userDependentTables = [
    { table: "audit_item_responses", col: "responded_by" },
    { table: "audit_item_evidences", col: "uploaded_by" },
    { table: "audit_versions", col: "approved_by" },
    { table: "audit_programs", col: "created_by" },
    { table: "audit_findings", col: "created_by" },
    { table: "audit_findings", col: "assigned_to" },
    { table: "audit_evidences", col: "uploaded_by" },
    { table: "audit_action_plans", col: "created_by" },
    { table: "audit_action_plans", col: "assigned_to" },
    { table: "audit_activity_log", col: "performed_by" },
    { table: "profiles", col: "id" },
    { table: "user_settings", col: "user_id" },
    { table: "notifications", col: "user_id" },
    { table: "device_trusts", col: "user_id" },
  ];

  const userIdsToDelete = usersToDelete.map((u: any) => u.id);
  if (userIdsToDelete.length > 0) {
    console.log(`    🧹 Limpando tabelas vinculadas a User ID...`);
    for (const item of userDependentTables) {
      const { error } = await supabase
        .from(item.table)
        .delete()
        .in(item.col, userIdsToDelete);

      if (error && !error.message.includes("column does not exist")) {
        console.warn(
          `      ⚠️ Erro ao limpar ${item.table}.${item.col}: ${error.message}`,
        );
      }
    }

    // Garantir remoção dos memberships (FK)
    await supabase
      .from("tenant_members")
      .delete()
      .in("user_id", userIdsToDelete);
  }

  // 8. Deletar membros e depois tenants (para evitar FK de membros)
  if (tenantsToDelete.length > 0) {
    console.log(`    🧹 Deletando membros e tenants...`);
    await supabase
      .from("tenant_members")
      .delete()
      .in("tenant_id", tenantsToDelete);
    await supabase.from("tenants").delete().in("id", tenantsToDelete);
  }

  // 9. Remover do Auth
  console.log(`  🗑️ Removendo usuários do Auth...`);
  for (const user of usersToDelete) {
    const { error } = await supabase.auth.admin.deleteUser(user.id);
    if (error) {
      console.error(`    🔴 Erro ao deletar ${user.email}: ${error.message}`);
    } else {
      console.log(`    ✅ Deletado: ${user.email}`);
    }
  }

  console.log(
    `✨ SUCESSO [${name}]: ${usersToDelete.length} usuários e ${tenantsToDelete.length} tenants removidos.`,
  );
}

async function run() {
  dotenv.config({ path: path.resolve(process.cwd(), ".env") });
  if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    await cleanupProject(
      "BETA",
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
    );
  }

  dotenv.config({
    path: path.resolve(process.cwd(), ".env.production"),
    override: true,
  });
  if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    await cleanupProject(
      "PROD",
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
    );
  }
}

run().catch(console.error);
