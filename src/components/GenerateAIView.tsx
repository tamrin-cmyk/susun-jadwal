import React, { useState } from 'react';
import { ScheduleSlot, Assignment, Teacher, Subject, ClassItem, TimeSlot, SchoolConfig, ScheduleConflict } from '../types';
import { Sparkles, RefreshCw, AlertCircle, CheckCircle2, ChevronRight, BrainCircuit, Loader2, BookOpen } from 'lucide-react';
import { solveSchedule, checkConflicts } from '../utils/schedulerSolver';

interface GenerateAIViewProps {
  config: SchoolConfig;
  assignments: Assignment[];
  teachers: Teacher[];
  subjects: Subject[];
  classes: ClassItem[];
  timeSlots: TimeSlot[];
  days: string[];
  slots: ScheduleSlot[];
  onUpdateSlots: (newSlots: ScheduleSlot[]) => void;
  conflicts: ScheduleConflict[];
}

export default function GenerateAIView({
  config,
  assignments,
  teachers,
  subjects,
  classes,
  timeSlots,
  days,
  slots,
  onUpdateSlots,
  conflicts
}: GenerateAIViewProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [aiMessageIndex, setAiMessageIndex] = useState(0);

  const aiLoadingMessages = [
    "Membaca draf jadwal pelajaran...",
    "Menganalisis kompetensi guru kejuruan DKV...",
    "Memeriksa beban mengajar Guru Tamrin, S.Pd...",
    "Memverifikasi modul anti-bentrok dwi-kelas...",
    "Merancang distribusi jam pelajaran pedagogis...",
    "Menyusun rekomendasi penyesuaian akhir..."
  ];

  // Rotate messages while loading
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAiLoading) {
      interval = setInterval(() => {
        setAiMessageIndex((prev) => (prev + 1) % aiLoadingMessages.length);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isAiLoading]);

  const handleGenerateLocal = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const solved = solveSchedule(assignments, classes, days, timeSlots, teachers);
      onUpdateSlots(solved);
      setIsGenerating(false);
      // Clear AI report if slots changed
      setAiReport(null);
    }, 800);
  };

  const handleFetchAiAnalysis = async () => {
    setIsAiLoading(true);
    setAiMessageIndex(0);
    try {
      const response = await fetch('/api/gemini-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          config,
          teachers,
          subjects,
          classes,
          assignments,
          slots,
          conflicts,
          days
        })
      });
      const data = await response.json();
      if (data.success) {
        setAiReport(data.analysis);
      } else {
        setAiReport(`Gagal memuat analisis: ${data.error}`);
      }
    } catch (e: any) {
      setAiReport(`Terjadi kesalahan jaringan: ${e.message || e}`);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Safe client-side lightweight Markdown renderer to support bullet lists, headers, and bold strings
  const renderMarkdown = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      let trimmed = line.trim();
      
      // Header 3
      if (trimmed.startsWith('###')) {
        return (
          <h4 key={idx} className="text-sm font-extrabold text-slate-800 mt-5 mb-2 flex items-center border-b border-slate-100 pb-1">
            <ChevronRight className="w-4 h-4 text-indigo-500 mr-1 shrink-0" />
            {trimmed.replace(/^###\s*/, '')}
          </h4>
        );
      }
      
      // Header 2 or 1
      if (trimmed.startsWith('##') || trimmed.startsWith('#')) {
        return (
          <h3 key={idx} className="text-base font-bold text-indigo-900 mt-6 mb-3 border-l-4 border-indigo-600 pl-2">
            {trimmed.replace(/^##?\s*/, '')}
          </h3>
        );
      }

      // Bullets
      if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
        const content = trimmed.replace(/^[-*]\s*/, '');
        return (
          <li key={idx} className="ml-5 list-disc text-xs text-slate-600 mb-1.5 leading-relaxed">
            {parseBoldText(content)}
          </li>
        );
      }

      // Ordered list
      if (/^\d+\./.test(trimmed)) {
        const content = trimmed.replace(/^\d+\.\s*/, '');
        const number = trimmed.match(/^\d+/)![0];
        return (
          <div key={idx} className="flex items-start space-x-2 text-xs text-slate-600 mb-2 leading-relaxed ml-2">
            <span className="font-bold text-indigo-600 text-xs shrink-0 bg-indigo-50 w-5 h-5 rounded-full flex items-center justify-center">{number}</span>
            <div className="flex-1 pt-0.5">{parseBoldText(content)}</div>
          </div>
        );
      }

      // Empty space
      if (!trimmed) {
        return <div key={idx} className="h-2"></div>;
      }

      // Normal paragraph
      return (
        <p key={idx} className="text-xs text-slate-600 leading-relaxed mb-2">
          {parseBoldText(trimmed)}
        </p>
      );
    });
  };

  // Helper to parse **bold** text in Markdown
  const parseBoldText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="font-bold text-slate-900">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <div id="generate-ai-view-container" className="space-y-6">
      {/* Top action layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Local solver controller */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="inline-flex items-center text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100 px-2.5 py-1 rounded-full">
              <Sparkles className="w-3.5 h-3.5 mr-1 text-blue-500" />
              Algoritma Anti-Bentrok Instan
            </div>
            <h2 className="text-lg font-bold text-slate-800">Penyusunan Otomatis Cepat</h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Sistem akan menjalankan modul pencarian rute heuristik untuk menata {assignments.reduce((sum, curr) => sum + curr.hoursPerWeek, 0)} JP mengajar ke dalam draf bebas bentrok dwi-guru/dwi-kelas dalam sekejap.
            </p>
          </div>

          <button
            onClick={handleGenerateLocal}
            disabled={isGenerating || assignments.length === 0}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold text-sm shadow-sm hover:shadow transition flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Menyusun Jadwal...</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                <span>Auto-Generate Jadwal</span>
              </>
            )}
          </button>
        </div>

        {/* Gemini expert advisor trigger */}
        <div className="bg-slate-900 rounded-xl shadow-sm p-6 text-white flex flex-col justify-between space-y-4 relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-2xl"></div>
          
          <div className="space-y-2 relative z-10">
            <div className="inline-flex items-center text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2.5 py-1 rounded-full">
              <BrainCircuit className="w-3.5 h-3.5 mr-1 text-indigo-400" />
              Konsultan Kurikulum AI
            </div>
            <h2 className="text-lg font-bold text-white">Analisis Kurikulum Gemini 3.5</h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Minta asisten AI menelaah draf jadwal Anda secara pedagogis. Mendapatkan saran distribusi jam produktif DKV, jam istirahat, serta kelayakan draf.
            </p>
          </div>

          <button
            onClick={handleFetchAiAnalysis}
            disabled={isAiLoading || slots.length === 0}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm shadow-sm hover:shadow-md transition flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {isAiLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Menganalisis...</span>
              </>
            ) : (
              <>
                <BrainCircuit className="w-4 h-4" />
                <span>Minta Analisis AI (Gemini)</span>
              </>
            )}
          </button>
        </div>

      </div>

      {/* Main Analysis and Conflicts results */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Auditor & List logs (1/3 width) */}
        <div className="space-y-5 lg:col-span-1">
          {/* Audit Status */}
          <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-slate-800">Laporan Keamanan Jadwal</h3>

            <div className="space-y-3">
              {conflicts.length === 0 ? (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-800 space-y-2">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <h4 className="text-xs font-bold uppercase tracking-wider">Aman (Anti-Bentrok)</h4>
                  </div>
                  <p className="text-[11px] text-emerald-700 leading-relaxed">
                    Sistem tidak menemukan adanya guru mengajar di dua kelas sekaligus maupun tabrakan rombel. Jadwal aman untuk dicetak.
                  </p>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-100 text-amber-800 space-y-2">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                    <h4 className="text-xs font-bold uppercase tracking-wider">{conflicts.length} Konflik Terdeteksi</h4>
                  </div>
                  <p className="text-[11px] text-amber-700 leading-relaxed">
                    Ditemukan beberapa tabrakan guru/kelas. Gunakan tombol "Auto-Generate" di atas untuk menormalkan kembali draf.
                  </p>
                </div>
              )}

              {/* Conflict Detail List */}
              {conflicts.length > 0 && (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {conflicts.map((cf, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs text-slate-700 flex items-start space-x-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-1.5"></span>
                      <p className="leading-relaxed">{cf.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Guidance Info */}
          <div className="bg-slate-50 rounded-xl border border-slate-200/50 p-5 space-y-3.5">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Kaidah Sekolah (DKV)</h4>
            <div className="space-y-2.5 text-xs text-slate-600">
              <p>
                1. <strong>Sistem Blok Produktif</strong>: Pelajaran praktikum seperti <em>Videografi</em> atau <em>Animasi 2D/3D</em> membutuhkan slot waktu minimal 4-5 JP berturut-turut agar siswa dapat fokus menyelesaikan tugas proyek.
              </p>
              <p>
                2. <strong>Beban Mengajar Guru</strong>: Pastikan total JP guru mengajar sesuai target, contohnya ahli DKV <strong>Guru Tamrin, S.Pd</strong> mengampu jam kejuruan utama di rombel X, XI, dan XII.
              </p>
            </div>
          </div>
        </div>

        {/* AI Output / Report View (2/3 width) */}
        <div className="lg:col-span-2">
          {isAiLoading ? (
            <div className="bg-white rounded-xl border border-slate-100 p-8 shadow-sm text-center min-h-[300px] flex flex-col justify-center items-center space-y-4">
              <div className="p-4 rounded-full bg-indigo-50 animate-pulse text-indigo-600">
                <BrainCircuit className="w-10 h-10 animate-spin" />
              </div>
              <div className="space-y-2 max-w-sm mx-auto">
                <h4 className="text-sm font-bold text-slate-800">Menyusun Analisis Kurikulum...</h4>
                <p className="text-xs text-indigo-600 animate-pulse font-semibold h-4">
                  {aiLoadingMessages[aiMessageIndex]}
                </p>
                <p className="text-[11px] text-slate-400 mt-2">Ini mungkin memakan waktu hingga 15-30 detik. Kami sedang mengonsultasikan data jadwal Anda ke model Gemini.</p>
              </div>
            </div>
          ) : aiReport ? (
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden animate-fade-in">
              <div className="px-6 py-4 border-b border-slate-100 bg-indigo-50/20 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <BrainCircuit className="w-5 h-5 text-indigo-600" />
                  <span className="text-sm font-bold text-indigo-950">Laporan Hasil Analisis Asisten Kurikulum AI</span>
                </div>
                <button
                  onClick={handleFetchAiAnalysis}
                  className="inline-flex items-center text-xs font-bold text-indigo-600 hover:text-indigo-800"
                >
                  <RefreshCw className="w-3.5 h-3.5 mr-1" /> Segarkan
                </button>
              </div>
              <div className="p-6 md:p-8 space-y-1 prose prose-slate max-w-none">
                {renderMarkdown(aiReport)}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-100 p-8 shadow-sm text-center min-h-[300px] flex flex-col justify-center items-center space-y-4 text-slate-400">
              <BrainCircuit className="w-12 h-12 text-slate-300" />
              <div className="max-w-md space-y-1.5">
                <h4 className="text-sm font-bold text-slate-700">Analisis Belum Dijalankan</h4>
                <p className="text-xs text-slate-500">
                  Klik tombol <strong>"Minta Analisis AI"</strong> di atas setelah menjadwalkan agar sistem cerdas memeriksa kelayakan draf jadwal Anda secara otomatis dan memberikan ulasan pedagogis kurikulum.
                </p>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
