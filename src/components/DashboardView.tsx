import React from 'react';
import { Subject, Teacher, ClassItem, Assignment, SchoolConfig } from '../types';
import { BookOpen, Users, Landmark, Clock, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

interface DashboardViewProps {
  config: SchoolConfig;
  subjects: Subject[];
  teachers: Teacher[];
  classes: ClassItem[];
  assignments: Assignment[];
  totalSlotsScheduled: number;
  totalConflicts: number;
  onNavigate: (tab: any) => void;
}

export default function DashboardView({
  config,
  subjects,
  teachers,
  classes,
  assignments,
  totalSlotsScheduled,
  totalConflicts,
  onNavigate
}: DashboardViewProps) {
  
  // Calculate statistics
  const totalJP = assignments.reduce((acc, curr) => acc + curr.hoursPerWeek, 0);
  
  const stats = [
    { id: 'stat-subj', label: 'Mata Pelajaran', value: subjects.length, icon: BookOpen, color: 'text-indigo-600 bg-indigo-50 border border-indigo-100' },
    { id: 'stat-teach', label: 'Data Guru', value: teachers.length, icon: Users, color: 'text-emerald-600 bg-emerald-50 border border-emerald-100' },
    { id: 'stat-class', label: 'Data Kelas', value: classes.length, icon: Landmark, color: 'text-amber-600 bg-amber-50 border border-amber-100' },
    { id: 'stat-jp', label: 'Total Jam Beban (JP)', value: `${totalJP} JP`, icon: Clock, color: 'text-sky-600 bg-sky-50 border border-sky-100' },
  ];

  const steps = [
    { id: 'step-1', title: 'Konfigurasi Lembaga', desc: 'Atur nama sekolah, tahun ajaran, kepala sekolah, dan tanda tangan.', completed: !!config.namaInstansi, tab: 'config' },
    { id: 'step-2', title: 'Data Master (Guru, Mapel, Kelas)', desc: 'Tambahkan data guru, daftar mata pelajaran DKV/Umum, serta kelas.', completed: teachers.length > 0 && subjects.length > 0 && classes.length > 0, tab: 'teachers' },
    { id: 'step-3', title: 'Beban Penugasan', desc: 'Petakan pembagian jam (JP) mengajar setiap guru di kelas yang sesuai.', completed: assignments.length > 0, tab: 'assignments' },
    { id: 'step-4', title: 'Generate Jadwal (Anti Bentrok)', desc: 'Gunakan sistem cerdas untuk menyusun jadwal instan bebas bentrok.', completed: totalSlotsScheduled > 0, tab: 'generate-ai' },
    { id: 'step-5', title: 'Cetak & Publikasi', desc: 'Lihat jadwal rapi per kelas atau per guru, lalu cetak draf resminya.', completed: totalSlotsScheduled > 0 && totalConflicts === 0, tab: 'print' },
  ];

  return (
    <div id="dashboard-view-container" className="space-y-6">
      {/* Welcome Banner */}
      <div id="welcome-banner" className="bg-gradient-to-r from-blue-700 via-indigo-700 to-indigo-800 text-white rounded-2xl p-6 md:p-8 shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-8 w-64 h-64 bg-white/5 rounded-full blur-2xl"></div>
        <div className="absolute right-1/4 bottom-0 translate-y-16 w-48 h-48 bg-indigo-500/10 rounded-full blur-xl"></div>
        
        <div className="relative z-10 space-y-3">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-100 backdrop-blur-sm border border-blue-500/30">
            Sistem Penjadwalan Cerdas v2.5
          </span>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Selamat datang di Portal {config.jenjang} {config.namaInstansi} Tebo 👋
          </h1>
          <p className="text-blue-100 max-w-2xl text-sm md:text-base">
            Sistem manajemen penyusunan jadwal pelajaran otomatis terintegrasi. Khusus dioptimalkan untuk program keahlian 
            <strong className="text-white ml-1">Desain Komunikasi Visual (DKV)</strong>. Bebas konflik guru mengajar ("Anti-Bentrok").
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={() => onNavigate('generate-ai')}
              className="inline-flex items-center px-4 py-2 text-xs md:text-sm font-medium bg-white text-indigo-700 rounded-lg hover:bg-indigo-50 transition shadow-sm"
            >
              <Sparkles className="w-4 h-4 mr-1.5 text-indigo-600" />
              Susu Jadwal Sekarang
            </button>
            <div className="inline-flex items-center text-xs text-blue-200 bg-white/10 px-3 py-1.5 rounded-lg border border-white/10">
              <span className="w-2 h-2 rounded-full bg-emerald-400 mr-2 animate-pulse"></span>
              Tahun Ajaran: {config.tahunAjaran} - Semester: {config.semester}
            </div>
          </div>
        </div>
      </div>

      {/* Summary Grid */}
      <div id="stats-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.id} className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 flex items-center space-x-4">
              <div className={`p-3 rounded-xl ${stat.color}`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{stat.label}</p>
                <h3 className="text-2xl font-bold text-slate-800 mt-0.5">{stat.value}</h3>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content Layout (Grid of Guides + Notifications) */}
      <div id="main-dashboard-grid" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Step-by-Step Interactive Guide */}
        <div id="step-guide" className="lg:col-span-2 bg-white rounded-xl p-6 border border-slate-100 shadow-sm space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Alur Penyusunan Jadwal Pelajaran</h2>
            <p className="text-sm text-slate-500">Ikuti panduan lima langkah di bawah ini untuk hasil draf jadwal resmi yang sempurna.</p>
          </div>
          
          <div className="space-y-3.5 relative before:absolute before:left-5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
            {steps.map((step, index) => (
              <div 
                key={step.id} 
                className="flex items-start space-x-4 relative group cursor-pointer"
                onClick={() => onNavigate(step.tab)}
              >
                <div className={`z-10 flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${
                  step.completed 
                    ? 'bg-indigo-50 border-indigo-600 text-indigo-600' 
                    : 'bg-white border-slate-200 text-slate-400 group-hover:border-slate-300'
                }`}>
                  {step.completed ? (
                    <CheckCircle2 className="w-5 h-5 fill-indigo-50 text-indigo-600" />
                  ) : (
                    <span className="text-xs font-semibold">{index + 1}</span>
                  )}
                </div>
                <div className="flex-1 bg-slate-50/50 group-hover:bg-slate-50 p-3 rounded-lg border border-slate-100/50 transition duration-150">
                  <h4 className="text-sm font-semibold text-slate-800 flex items-center">
                    {step.title}
                    {step.completed && (
                      <span className="ml-2 text-[10px] font-medium bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-100">Ready</span>
                    )}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar Info Panels (Conflicts & Quick actions) */}
        <div id="dashboard-info-panels" className="space-y-6">
          {/* Integrity Schedule Status */}
          <div id="schedule-status-card" className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm space-y-4">
            <h3 className="font-semibold text-slate-900 text-sm">Status Integritas Jadwal</h3>
            
            <div className="space-y-3">
              {totalSlotsScheduled > 0 ? (
                <>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-xs text-slate-500 font-medium">Terisi</span>
                    <span className="text-xs font-bold text-slate-800">{totalSlotsScheduled} Jam Pelajaran</span>
                  </div>

                  {totalConflicts === 0 ? (
                    <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-800 flex items-start space-x-2.5">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xs font-bold">Hebat! 100% Beban Terpenuhi</h4>
                        <p className="text-[11px] text-emerald-700 mt-0.5">Sistem memverifikasi tidak ada konflik jam mengajar guru atau tabrakan ruang kelas.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-lg bg-amber-50 border border-amber-100 text-amber-800 flex items-start space-x-2.5">
                      <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xs font-bold">Terdeteksi {totalConflicts} Konflik/Bentrok</h4>
                        <p className="text-[11px] text-amber-700 mt-0.5">Ada penugasan guru yang bertabrakan di jam pelajaran yang sama. Segera audit kembali di menu Generate AI.</p>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-100 text-slate-600 text-center py-6">
                  <Clock className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <h4 className="text-xs font-bold">Jadwal Belum Dibuat</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Silakan masuk ke tab Generate AI untuk menyusun jadwal pelajaran otomatis.</p>
                </div>
              )}
            </div>
          </div>

          {/* DKV Major Highlight Info */}
          <div id="dkv-info-panel" className="bg-slate-900 text-slate-100 rounded-xl p-5 shadow-sm space-y-3.5 relative overflow-hidden">
            <div className="absolute right-0 bottom-0 translate-x-8 translate-y-8 w-24 h-24 bg-white/5 rounded-full blur-xl"></div>
            <Landmark className="w-8 h-8 text-amber-400" />
            <div className="space-y-1">
              <h3 className="font-bold text-sm text-white">SMKS Cordova Tebo - Fokus DKV</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Kurikulum Desain Komunikasi Visual (DKV) membutuhkan manajemen blok praktikum terpadu (seperti fotografi, videografi, dan komputer grafis) agar porsi pengerjaan tugas proyek kreatif efisien.
              </p>
            </div>
            <div className="border-t border-slate-800 pt-3 flex items-center justify-between text-[11px] text-slate-400">
              <span>Program Keahlian</span>
              <span className="font-bold text-amber-400">Seni & Ekonomi Kreatif</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
