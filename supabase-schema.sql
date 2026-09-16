-- Schema Database Supabase untuk Bank Sekolah SMPN 257 Jakarta

-- 1. Table: classes (Master Kelas)
CREATE TABLE IF NOT EXISTS classes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  grade VARCHAR(10) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 2. Table: students (Master Siswa)
CREATE TABLE IF NOT EXISTS students (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nis VARCHAR(100),
  name VARCHAR(150) NOT NULL,
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  balance NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 3. Table: periods (Master Periode)
CREATE TABLE IF NOT EXISTS periods (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  year INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  UNIQUE(month, year)
);

-- 4. Table: activities (Checklist Kegiatan Bank Sekolah)
CREATE TABLE IF NOT EXISTS activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  period_id UUID REFERENCES periods(id) ON DELETE CASCADE,
  mijel BOOLEAN DEFAULT false,
  bank_sampah BOOLEAN DEFAULT false,
  tabungan BOOLEAN DEFAULT false,
  infaq BOOLEAN DEFAULT false,
  is_absent BOOLEAN DEFAULT false,
  deposit NUMERIC DEFAULT 0,
  withdrawal NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  UNIQUE(student_id, period_id)
);

-- Disable Row Level Security (RLS) agar aplikasi dapat membaca dan menulis data secara langsung dengan Anon Key
ALTER TABLE classes DISABLE ROW LEVEL SECURITY;
ALTER TABLE students DISABLE ROW LEVEL SECURITY;
ALTER TABLE periods DISABLE ROW LEVEL SECURITY;
ALTER TABLE activities DISABLE ROW LEVEL SECURITY;

-- Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';

