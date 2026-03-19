import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Replace these with your actual Supabase URL and Anon Key
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
window.supabase = supabase;

// Cloudinary credentials
window.CLOUDINARY_CLOUD = "YOUR_CLOUDINARY_CLOUD_NAME";
window.CLOUDINARY_PRESET = "YOUR_CLOUDINARY_UPLOAD_PRESET";
