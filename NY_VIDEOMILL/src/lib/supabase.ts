/**
 * Bakoverkompatibel re-eksport.
 * All ny kode bør importere direkte fra './supabaseClient'.
 *
 * Eksisterende imports som `import { supabase } from '../lib/supabase'`
 * fortsetter å fungere uten endringer.
 */
export { supabase, getSupabaseClient } from './supabaseClient';
