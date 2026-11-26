import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://kanclgjnicfwexmvcjea.supabase.co";

const supabaseKey = "sb_publishable_ewe9lU6aDIk4HSDputw7Pg_5EOOAeQD";

export const supabase = createClient(
  supabaseUrl,
  supabaseKey
);
