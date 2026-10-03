import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key";

/**
 * Cliente de Supabase para operaciones en el navegador (cliente).
 * Usa la clave pública (anon key) que es segura para exponer.
 */
export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
