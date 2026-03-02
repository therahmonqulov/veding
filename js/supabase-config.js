/* ===================================================
   supabase-config.js — Supabase konfiguratsiyasi
   ===================================================
   BU FAYLGA O'Z SUPABASE MA'LUMOTLARINGIZNI KIRITING:

   1. https://supabase.com saytiga kiring
   2. Yangi project yarating
   3. Project Settings → API bo'limiga o'ting
   4. Quyidagi qiymatlarga "Project URL" va "anon public key" ni nusxalang
   =================================================== */

window.SUPABASE_URL = 'https://hbzmbshnjklbhdiypuvk.supabase.co';
// ⚠️ XATO: 'sb_secret_...' - bu secret key, ANON key emas!
// Supabase → Project Settings → API → 'anon public' kalitini oling (eyJ... bilan boshlanadi)
window.SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhiem1ic2huamtsYmhkaXlwdXZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxMjA2NDYsImV4cCI6MjA4NzY5NjY0Nn0.sl0fd4SWD-IiBpuekGw6rZSJqzmNg8hchPSHPbGmM8g';

/* ===================================================
   SUPABASE DA YARATISH KERAK BO'LGAN JADVALLAR:

   1) "elonlar" jadvali:
   ─────────────────────────────────────────────────
   CREATE TABLE elonlar (
     id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
     name        text NOT NULL,
     region      text,
     type        text,
     description text,
     photos      text[],          -- Supabase Storage URL lari
     capacity    integer,
     area        text,
     floors      text,
     work_days   integer[],       -- [0=Dush,1=Sesh,...,6=Yak]
     work_start  text,
     work_end    text,
     work_24h    boolean DEFAULT false,
     smoking     text DEFAULT 'no',
     alcohol     text DEFAULT 'no',
     price       numeric,
     phone       text,
     instagram   text,
     telegram    text,
     email       text,
     created_at  timestamptz DEFAULT now()
   );

   2) Storage bucket: "elon-photos" nomli bucket yarating
      (public bucket bo'lishi kerak)

   3) RLS (Row Level Security) qoidalari:
      -- Hamma o'qiy olsin:
      CREATE POLICY "read_all" ON elonlar FOR SELECT USING (true);
      -- Faqat autentifikatsiyalangan foydalanuvchilar yozsin:
      CREATE POLICY "insert_auth" ON elonlar FOR INSERT
        WITH CHECK (auth.role() = 'authenticated');
   =================================================== */