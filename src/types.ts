export interface SchoolConfig {
  jenjang: string;
  namaInstansi: string;
  tahunAjaran: string;
  semester: string;
  namaKepalaSekolah: string;
  nipKepalaSekolah: string;
  namaWakaKurikulum: string;
  nipWakaKurikulum: string;
  kota: string;
  alamat: string;
  logoUrl: string;
  offDays?: string[];
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  kelompok: 'A' | 'B' | 'C'; // A: Nasional, B: Kewilayahan, C: Kejuruan/DKV
  totalJP: number;
}

export interface Teacher {
  id: string;
  code: string; // Initial/Code, e.g., PL, EK, TR
  name: string;
  nip: string;
  preferredDays?: string[];
  unavailableDays?: string[];
}

export interface ClassItem {
  id: string;
  name: string; // e.g., X DKV, XI DKV, XII DKV
  waliKelasId: string; // Teacher ID
}

export interface Assignment {
  id: string;
  teacherId: string;
  subjectId: string;
  classId: string;
  hoursPerWeek: number; // Jumlah Jam Pelajaran (JP) per minggu
}

export interface TimeSlot {
  id: string;
  period: number; // 1, 2, 3...
  startTime: string; // "07:15"
  endTime: string; // "08:00"
  isBreak: boolean;
  label?: string; // e.g., "Upacara", "Istirahat", "Sholat"
  day?: string; // Optional: Only applies on specific day (e.g. "Senin" for Upacara)
}

export interface ScheduleSlot {
  classId: string;
  day: string; // "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"
  period: number; // period number (1-10)
  assignmentId: string; // links to Assignment, or "BREAK", or ""
}

export interface ScheduleConflict {
  type: 'TEACHER_DOUBLE_BOOKING' | 'CLASS_DOUBLE_BOOKING' | 'OVER_HOURS' | 'INVALID_SLOT' | 'TEACHER_UNAVAILABLE' | 'TEACHER_PREFERRED_MISMATCH';
  description: string;
  day?: string;
  period?: number;
  classId?: string;
  teacherId?: string;
}

export type ActiveTab =
  | 'dashboard'
  | 'config'
  | 'subjects'
  | 'teachers'
  | 'classes'
  | 'assignments'
  | 'time-templates'
  | 'generate-ai'
  | 'schedule-editor'
  | 'print'
  | 'recap';
