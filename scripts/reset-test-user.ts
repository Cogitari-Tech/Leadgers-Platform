import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function findAndResetUser() {
  const email = process.env.TEST_EMAIL || "teste@leadgers.com";
  const newPassword = process.env.TEST_PASSWORD;

  // Never ship a hardcoded credential fallback — require it from the environment.
  if (!newPassword) {
    console.error(
      "Missing TEST_PASSWORD env var. Set it before running this script.",
    );
    process.exit(1);
  }

  console.log(`Checking for user: ${email}...`);

  // List users to find the ID
  const {
    data: { users },
    error: listError,
  } = await supabase.auth.admin.listUsers();

  if (listError) {
    console.error("Error listing users:", listError);
    return;
  }

  const user = users.find((u) => u.email === email);

  if (!user) {
    console.error(`User ${email} NOT FOUND!`);

    // Maybe create it?
    /*
    console.log("Creating user...");
    const { data: created, error: createError } = await supabase.auth.admin.createUser({
        email,
        password: newPassword,
        email_confirm: true
    });
    if (createError) console.error("Error creating user:", createError);
    else console.log("User created successfully:", created.user.id);
    */
    return;
  }

  console.log(`User found: ID=${user.id}`);

  // Update password
  console.log(`Updating password for ${email}...`);
  const { data: updated, error: updateError } =
    await supabase.auth.admin.updateUserById(user.id, {
      password: newPassword,
    });

  if (updateError) {
    console.error("Error updating password:", updateError);
  } else {
    console.log("Password updated successfully!");
  }
}

findAndResetUser();
