import { SchoolConfig, Subject, Teacher, ClassItem, Assignment, TimeSlot } from '../types';

export const defaultSchoolConfig: SchoolConfig = {
  jenjang: "SMKS",
  namaInstansi: "Cordova Tebo",
  tahunAjaran: "2026/2027",
  semester: "Ganjil",
  namaKepalaSekolah: "Poniman Abdul Latif, S.Sy",
  nipKepalaSekolah: "-",
  namaWakaKurikulum: "Eri Kurniawan, S.Pd.I",
  nipWakaKurikulum: "-",
  kota: "Tebo",
  alamat: "JL. Lawu Desa Suka Maju, Kec. Rimbo Ulu",
  logoUrl: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=200"
};

export const defaultSubjects: Subject[] = [
  // Kelompok A & B (Umum / Muatan Kewilayahan)
  { id: 'sub-pp', code: 'PP', name: 'Pendidikan Pancasila', kelompok: 'A', totalJP: 2 },
  { id: 'sub-bin', code: 'BIN', name: 'Bahasa Indonesia', kelompok: 'A', totalJP: 3 },
  { id: 'sub-mat', code: 'MAT', name: 'Matematika', kelompok: 'A', totalJP: 3 },
  { id: 'sub-sos', code: 'SOS', name: 'Sosiologi', kelompok: 'A', totalJP: 2 },
  { id: 'sub-eko', code: 'EKO', name: 'Ekonomi', kelompok: 'A', totalJP: 2 },
  { id: 'sub-sej', code: 'SEJ', name: 'Sejarah', kelompok: 'A', totalJP: 2 },
  { id: 'sub-binc', code: 'BINC', name: 'Bahasa Inggris', kelompok: 'A', totalJP: 3 },
  { id: 'sub-pjok', code: 'PJOK', name: 'Pendidikan Jasmani Olahraga Dan Kesehatan', kelompok: 'B', totalJP: 2 },
  { id: 'sub-inf', code: 'INF', name: 'Informatika', kelompok: 'A', totalJP: 2 },
  { id: 'sub-ipas', code: 'IPAS', name: 'IPAS', kelompok: 'A', totalJP: 2 },
  { id: 'sub-sb', code: 'SB', name: 'Seni Budaya', kelompok: 'B', totalJP: 2 },
  { id: 'sub-padb', code: 'PADB', name: 'Pendidikan Agama dan Budi Pekerti', kelompok: 'A', totalJP: 3 },
  { id: 'sub-mul', code: 'MUL', name: 'Mulok', kelompok: 'B', totalJP: 2 },

  // Kelompok C (Kejuruan DKV)
  { id: 'sub-pd2k', code: 'PD2K', name: 'Prinsip Dasar Desain dan Komunikasi', kelompok: 'C', totalJP: 4 },
  { id: 'sub-ppld', code: 'PPLD', name: 'Pengoperasian Perangkat Lunak Desain', kelompok: 'C', totalJP: 4 },
  { id: 'sub-mdb', code: 'MDB', name: 'Menerapkan Design Brief', kelompok: 'C', totalJP: 3 },
  { id: 'sub-fdv', code: 'FDV', name: 'Fotografi dan Videografi', kelompok: 'C', totalJP: 4 },
  { id: 'sub-kdkv', code: 'KDKV', name: 'Karya Desain Komunikasi Visual', kelompok: 'C', totalJP: 6 },
  { id: 'sub-mpp', code: 'MPP', name: 'Mata Pelajaran Pilihan', kelompok: 'C', totalJP: 2 },
  { id: 'sub-ptpu', code: 'PTPU', name: 'Profil technopreneur, peluang usaha, dan pekerjaan/profesi di bidang DKV', kelompok: 'C', totalJP: 2 },
  { id: 'sub-kslh', code: 'KSLH', name: 'Keselamatan, Kesehatan Kerja, dan Lingkungan Hidup', kelompok: 'C', totalJP: 2 },
  { id: 'sub-pbbi', code: 'PBBI', name: 'Proses bisnis berbagai industri kreatif', kelompok: 'C', totalJP: 2 },
  { id: 'sub-tdpp', code: 'TDPP', name: 'Teknik dasar proses produksi pada industri DKV', kelompok: 'C', totalJP: 2 },
  { id: 'sub-sdid', code: 'SDID', name: 'Sketsa dan ilustrasi dasar', kelompok: 'C', totalJP: 3 },
  { id: 'sub-kdld', code: 'KDLD', name: 'Komposisi dan layout dasar', kelompok: 'C', totalJP: 3 },
  { id: 'sub-dt', code: 'DT', name: 'Dasar-dasar tipografi', kelompok: 'C', totalJP: 2 },
  { id: 'sub-pkk', code: 'PKK', name: 'Projek Kreatif dan Kewirausahaan', kelompok: 'C', totalJP: 5 }
];

export const defaultTeachers: Teacher[] = [
  { id: 't-ra', code: 'RA', name: 'Ryzki Apriliani, S.Kom', nip: '-', preferredDays: ['Senin', 'Selasa'] },
  { id: 't-br', code: 'BR', name: 'Bu Ruroh', nip: '-' },
  { id: 't-af', code: 'AF', name: 'Alvi Fauziyah', nip: '-' },
  { id: 't-sp', code: 'SP', name: 'Sapiun', nip: '-' },
  { id: 't-ak', code: 'AK', name: 'Abdul Karim', nip: '-' },
  { id: 't-ek', code: 'EK', name: 'Eri Kurniawan, S.Pd.I', nip: '-', unavailableDays: ['Rabu'] },
  { id: 't-ha', code: 'HA', name: 'Hasyim Asy\'ari', nip: '-' },
  { id: 't-ub', code: 'UB', name: 'Ubaidillah', nip: '-' },
  { id: 't-tr', code: 'TR', name: 'Tamrin, S.Pd', nip: '198402122019031005', preferredDays: ['Kamis'], unavailableDays: ['Jumat'] },
  { id: 't-vv', code: 'VV', name: 'Vivi Veronika, S.Pd.I', nip: '-' },
  { id: 't-ab', code: 'AB', name: 'Abah Kholiq', nip: '-' },
  { id: 't-zm', code: 'ZM', name: 'ZAIM SH', nip: '-' }
];

export const defaultClasses: ClassItem[] = [
  { id: 'c-x', name: 'X DKV', waliKelasId: 't-ra' },
  { id: 'c-xi', name: 'XI DKV', waliKelasId: 't-tr' },
  { id: 'c-xii', name: 'XII DKV', waliKelasId: 't-ek' }
];

export const defaultAssignments: Assignment[] = [
  // Kelas X DKV
  { id: 'a-x-1', teacherId: 't-ek', subjectId: 'sub-padb', classId: 'c-x', hoursPerWeek: 3 },
  { id: 'a-x-2', teacherId: 't-vv', subjectId: 'sub-pp', classId: 'c-x', hoursPerWeek: 2 },
  { id: 'a-x-3', teacherId: 't-br', subjectId: 'sub-bin', classId: 'c-x', hoursPerWeek: 3 },
  { id: 'a-x-4', teacherId: 't-af', subjectId: 'sub-mat', classId: 'c-x', hoursPerWeek: 3 },
  { id: 'a-x-5', teacherId: 't-ha', subjectId: 'sub-binc', classId: 'c-x', hoursPerWeek: 3 },
  { id: 'a-x-6', teacherId: 't-sp', subjectId: 'sub-pjok', classId: 'c-x', hoursPerWeek: 2 },
  { id: 'a-x-7', teacherId: 't-ra', subjectId: 'sub-inf', classId: 'c-x', hoursPerWeek: 2 },
  { id: 'a-x-8', teacherId: 't-ub', subjectId: 'sub-ipas', classId: 'c-x', hoursPerWeek: 2 },
  { id: 'a-x-9', teacherId: 't-br', subjectId: 'sub-sb', classId: 'c-x', hoursPerWeek: 2 },
  { id: 'a-x-10', teacherId: 't-ra', subjectId: 'sub-kslh', classId: 'c-x', hoursPerWeek: 2 },
  { id: 'a-x-11', teacherId: 't-tr', subjectId: 'sub-pbbi', classId: 'c-x', hoursPerWeek: 2 },
  { id: 'a-x-12', teacherId: 't-tr', subjectId: 'sub-tdpp', classId: 'c-x', hoursPerWeek: 2 },
  { id: 'a-x-13', teacherId: 't-tr', subjectId: 'sub-sdid', classId: 'c-x', hoursPerWeek: 3 },
  { id: 'a-x-14', teacherId: 't-tr', subjectId: 'sub-dt', classId: 'c-x', hoursPerWeek: 2 },

  // Kelas XI DKV
  { id: 'a-xi-1', teacherId: 't-vv', subjectId: 'sub-padb', classId: 'c-xi', hoursPerWeek: 3 },
  { id: 'a-xi-2', teacherId: 't-ek', subjectId: 'sub-pp', classId: 'c-xi', hoursPerWeek: 2 },
  { id: 'a-xi-3', teacherId: 't-br', subjectId: 'sub-bin', classId: 'c-xi', hoursPerWeek: 3 },
  { id: 'a-xi-4', teacherId: 't-af', subjectId: 'sub-mat', classId: 'c-xi', hoursPerWeek: 3 },
  { id: 'a-xi-5', teacherId: 't-ha', subjectId: 'sub-binc', classId: 'c-xi', hoursPerWeek: 3 },
  { id: 'a-xi-6', teacherId: 't-ak', subjectId: 'sub-sej', classId: 'c-xi', hoursPerWeek: 2 },
  { id: 'a-xi-7', teacherId: 't-ak', subjectId: 'sub-sos', classId: 'c-xi', hoursPerWeek: 2 },
  { id: 'a-xi-8', teacherId: 't-tr', subjectId: 'sub-pd2k', classId: 'c-xi', hoursPerWeek: 4 },
  { id: 'a-xi-9', teacherId: 't-ra', subjectId: 'sub-ppld', classId: 'c-xi', hoursPerWeek: 4 },
  { id: 'a-xi-10', teacherId: 't-ra', subjectId: 'sub-mdb', classId: 'c-xi', hoursPerWeek: 3 },
  { id: 'a-xi-11', teacherId: 't-tr', subjectId: 'sub-kdld', classId: 'c-xi', hoursPerWeek: 3 },
  { id: 'a-xi-12', teacherId: 't-ub', subjectId: 'sub-mul', classId: 'c-xi', hoursPerWeek: 2 },

  // Kelas XII DKV
  { id: 'a-xii-1', teacherId: 't-ek', subjectId: 'sub-padb', classId: 'c-xii', hoursPerWeek: 3 },
  { id: 'a-xii-2', teacherId: 't-br', subjectId: 'sub-bin', classId: 'c-xii', hoursPerWeek: 3 },
  { id: 'a-xii-3', teacherId: 't-af', subjectId: 'sub-mat', classId: 'c-xii', hoursPerWeek: 3 },
  { id: 'a-xii-4', teacherId: 't-ha', subjectId: 'sub-binc', classId: 'c-xii', hoursPerWeek: 3 },
  { id: 'a-xii-5', teacherId: 't-af', subjectId: 'sub-eko', classId: 'c-xii', hoursPerWeek: 2 },
  { id: 'a-xii-6', teacherId: 't-sp', subjectId: 'sub-sej', classId: 'c-xii', hoursPerWeek: 2 },
  { id: 'a-xii-7', teacherId: 't-tr', subjectId: 'sub-fdv', classId: 'c-xii', hoursPerWeek: 4 },
  { id: 'a-xii-8', teacherId: 't-tr', subjectId: 'sub-kdkv', classId: 'c-xii', hoursPerWeek: 6 },
  { id: 'a-xii-9', teacherId: 't-ra', subjectId: 'sub-mpp', classId: 'c-xii', hoursPerWeek: 2 },
  { id: 'a-xii-10', teacherId: 't-ab', subjectId: 'sub-ptpu', classId: 'c-xii', hoursPerWeek: 2 },
  { id: 'a-xii-11', teacherId: 't-ab', subjectId: 'sub-pkk', classId: 'c-xii', hoursPerWeek: 5 },
  { id: 'a-xii-12', teacherId: 't-zm', subjectId: 'sub-mul', classId: 'c-xii', hoursPerWeek: 2 }
];

export const defaultTimeSlots: TimeSlot[] = [
  { id: 'ts-upacara', period: 0, startTime: "07:00", endTime: "07:30", isBreak: true, label: "Upacara Bendera", day: "Senin" },
  { id: 'ts-1', period: 1, startTime: "07:30", endTime: "08:00", isBreak: false },
  { id: 'ts-2', period: 2, startTime: "08:00", endTime: "08:30", isBreak: false },
  { id: 'ts-3', period: 3, startTime: "08:30", endTime: "09:00", isBreak: false },
  { id: 'ts-4', period: 4, startTime: "09:00", endTime: "09:30", isBreak: false },
  { id: 'ts-b1', period: 0, startTime: "09:30", endTime: "09:50", isBreak: true, label: "Istirahat I" },
  { id: 'ts-5', period: 5, startTime: "09:50", endTime: "10:20", isBreak: false },
  { id: 'ts-6', period: 6, startTime: "10:20", endTime: "10:50", isBreak: false },
  { id: 'ts-7', period: 7, startTime: "10:50", endTime: "11:20", isBreak: false },
  { id: 'ts-b2', period: 0, startTime: "11:20", endTime: "11:50", isBreak: true, label: "Istirahat II / Sholat" },
  { id: 'ts-8', period: 8, startTime: "11:50", endTime: "12:20", isBreak: false },
  { id: 'ts-9', period: 9, startTime: "12:20", endTime: "12:50", isBreak: false },
  { id: 'ts-10', period: 10, startTime: "12:50", endTime: "13:20", isBreak: false },
  { id: 'ts-11', period: 11, startTime: "13:20", endTime: "13:50", isBreak: false }
];

export const defaultDays = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
