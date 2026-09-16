export type Role = 'Admin' | 'Petugas' | 'Wali Kelas';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface ClassData {
  id: string;
  name: string; // updated from class_name
  grade: string;
  created_at?: string;
}

export interface Student {
  id: string;
  nis?: string;
  name: string; // updated from student_name
  class_id: string;
  balance?: number;
  created_at?: string;
}

export interface Period {
  id: string;
  month: number | string;
  year: number;
  is_active?: boolean;
  created_at?: string;
}

export interface BankSchoolActivity {
  id: string;
  student_id: string;
  period_id: string;
  mijel?: boolean;
  bank_sampah?: boolean;
  tabungan?: boolean;
  infaq?: boolean;
  is_absent?: boolean;
  deposit?: number;
  withdrawal?: number;
  created_at?: string;
}
