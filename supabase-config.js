import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Replace these with your actual Supabase URL and Anon Key
const SUPABASE_URL = 'https://sywpqjdyqxtnejjileyfg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN5d3BhcWpkeHF0bmVqamlleWdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM4NDI1MzUsImV4cCI6MjA4OTQxODUzNX0.cAk-j2e2bSr_0uK_Ohjm878fPEhbf3ddkcyp1c11zbI';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
window.supabase = supabase;

// Cloudinary credentials
window.CLOUDINARY_CLOUD = "dqm7pmlwa";
window.CLOUDINARY_PRESET = "nexstudy_preset";
