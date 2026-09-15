export type Role = 'Admin' | 'Petugas' | 'Wali Kelas';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface ClassData {
  id: string;
  class_name: string;
  grade: string;
  teacher_name: string;
}

export interface Student {
  id: string;
  student_name: string;
  nis?: string;
  gender?: 'L' | 'P';
  class_id: string;
}

export interface Period {
  id: string;
  month: string; // e.g. "Januari", "Februari"
  year: number;
}

export interface BankSchoolActivity {
  id: string;
  student_id: string;
  class_id: string;
  period_id: string;
  mijel: boolean;
  bank_sampah: boolean;
  created_at?: string;
  updated_at?: string;
}
