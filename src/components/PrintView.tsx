import React, { useState } from 'react';
import { ScheduleSlot, Assignment, Teacher, Subject, ClassItem, TimeSlot, SchoolConfig } from '../types';
import { Printer, Landmark, Users, LayoutGrid, Calendar, HelpCircle, Award, BookOpen, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';

interface PrintViewProps {
  config: SchoolConfig;
  slots: ScheduleSlot[];
  assignments: Assignment[];
  teachers: Teacher[];
  subjects: Subject[];
  classes: ClassItem[];
  timeSlots: TimeSlot[];
  days: string[];
}

type ViewMode = 'class' | 'teacher' | 'master' | 'recap';

export default function PrintView({
  config,
  slots,
  assignments,
  teachers,
  subjects,
  classes,
  timeSlots,
  days
}: PrintViewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('class');
  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || '');
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>(teachers[0]?.id || '');

  const handlePrint = () => {
    window.print();
  };

  // Calculate stats for each teacher
  const getTeacherStats = (teacherId: string) => {
    const teacherAssigns = assignments.filter(a => a.teacherId === teacherId);
    const totalAssignedJP = teacherAssigns.reduce((sum, curr) => sum + curr.hoursPerWeek, 0);
    const scheduledJP = slots.filter(slot => {
      if (!slot.assignmentId || slot.assignmentId === 'BREAK') return false;
      const assign = assignments.find(a => a.id === slot.assignmentId);
      return assign?.teacherId === teacherId;
    }).length;

    const subjectsAndClasses = teacherAssigns.map(a => {
      const subj = subjects.find(s => s.id === a.subjectId);
      const cls = classes.find(c => c.id === a.classId);
      return `${subj?.code || 'Mapel'} di ${cls?.name || 'Kelas'} (${a.hoursPerWeek} JP)`;
    });

    return {
      totalAssignedJP,
      scheduledJP,
      subjectsAndClasses,
      status: scheduledJP === totalAssignedJP ? 'MATCH' : scheduledJP > totalAssignedJP ? 'OVER' : 'UNDER'
    };
  };

  // Helper Lookups
  const getAssignmentInfo = (assignmentId: string) => {
    if (!assignmentId) return null;
    const assign = assignments.find(a => a.id === assignmentId);
    if (!assign) return null;
    
    const teacher = teachers.find(t => t.id === assign.teacherId);
    const subject = subjects.find(s => s.id === assign.subjectId);
    const classItem = classes.find(c => c.id === assign.classId);

    return {
      teacherCode: teacher?.code || '?',
      teacherName: teacher?.name || '?',
      subjectCode: subject?.code || '?',
      subjectName: subject?.name || '?',
      className: classItem?.name || '?'
    };
  };

  const getSlotContentForClass = (classId: string, day: string, period: number) => {
    const slot = slots.find(s => s.classId === classId && s.day === day && s.period === period);
    if (!slot || !slot.assignmentId) return '';
    
    const info = getAssignmentInfo(slot.assignmentId);
    if (!info) return '';
    return `${info.subjectCode} (${info.teacherCode})`;
  };

  const getSlotContentForTeacher = (teacherId: string, day: string, period: number) => {
    // Find slot where assignment points to this teacher
    const slot = slots.find(s => {
      if (!s.assignmentId) return false;
      const assign = assignments.find(a => a.id === s.assignmentId);
      return assign?.teacherId === teacherId && s.day === day && s.period === period;
    });

    if (!slot) return '';
    const info = getAssignmentInfo(slot.assignmentId);
    if (!info) return '';
    return `${info.subjectCode} - ${info.className}`;
  };

  return (
    <div id="print-view-container" className="space-y-6">
      
      {/* Configuration panel (Hidden during browser printing) */}
      <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm flex flex-wrap items-center justify-between gap-4 print:hidden">
        <div className="flex items-center space-x-3">
          <Printer className="w-5 h-5 text-slate-500" />
          <div>
            <h2 className="text-sm font-bold text-slate-800">Preview & Cetak Dokumen Resmi</h2>
            <p className="text-xs text-slate-500">Atur format pratinjau lembar jadwal sebelum diunduh atau dicetak fisik.</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Format switches */}
          <div className="bg-slate-100 p-1 rounded-lg flex space-x-1">
            <button
              onClick={() => setViewMode('class')}
              className={`inline-flex items-center px-3 py-1.5 rounded-md text-xs font-bold transition ${
                viewMode === 'class' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Landmark className="w-3.5 h-3.5 mr-1.5" />
              Per Kelas
            </button>
            <button
              onClick={() => setViewMode('teacher')}
              className={`inline-flex items-center px-3 py-1.5 rounded-md text-xs font-bold transition ${
                viewMode === 'teacher' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5 mr-1.5" />
              Per Guru
            </button>
            <button
              onClick={() => setViewMode('master')}
              className={`inline-flex items-center px-3 py-1.5 rounded-md text-xs font-bold transition ${
                viewMode === 'master' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5 mr-1.5" />
              Master Board
            </button>
            <button
              onClick={() => setViewMode('recap')}
              className={`inline-flex items-center px-3 py-1.5 rounded-md text-xs font-bold transition ${
                viewMode === 'recap' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Award className="w-3.5 h-3.5 mr-1.5" />
              Cetak Rekap & Kode
            </button>
          </div>

          {/* Conditional Selectors */}
          {viewMode === 'class' && (
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="px-3 py-1.5 text-xs font-semibold border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {classes.map(c => (
                <option key={c.id} value={c.id}>Kelas {c.name}</option>
              ))}
            </select>
          )}

          {viewMode === 'teacher' && (
            <select
              value={selectedTeacherId}
              onChange={(e) => setSelectedTeacherId(e.target.value)}
              className="px-3 py-1.5 text-xs font-semibold border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {teachers.map(t => (
                <option key={t.id} value={t.id}>Guru {t.name} ({t.code})</option>
              ))}
            </select>
          )}

          <button
            onClick={handlePrint}
            className="inline-flex items-center px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm transition"
          >
            <Printer className="w-3.5 h-3.5 mr-1.5" />
            Cetak Sekarang
          </button>
        </div>
      </div>

      {/* Official timetable sheet (Target for window.print() and customized with @media print) */}
      <div 
        id="official-print-sheet" 
        className="bg-white rounded-2xl border border-slate-100 p-8 md:p-10 shadow-sm space-y-6 mx-auto max-w-5xl print:border-none print:shadow-none print:p-0"
      >
        {/* Kop Surat (School letterhead) */}
        <div className="flex items-center justify-between border-b-4 border-double border-slate-800 pb-5">
          <div className="flex items-center space-x-4">
            <img 
              src={config.logoUrl || "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=200"}
              alt="School Logo" 
              className="w-20 h-20 object-cover rounded-lg shrink-0"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=200';
              }}
            />
            <div className="text-left space-y-1">
              <h1 className="text-xl font-extrabold text-slate-900 tracking-wider uppercase">
                {config.jenjang} {config.namaInstansi} TEBO
              </h1>
              <p className="text-xs font-medium text-slate-500 tracking-wider uppercase">
                Program Keahlian: Desain Komunikasi Visual (DKV)
              </p>
              <p className="text-[11px] text-slate-500 italic max-w-xl leading-snug">
                Alamat: {config.alamat}, Kota/Kabupaten {config.kota}
              </p>
            </div>
          </div>
          <div className="text-right text-xs text-slate-400 font-mono hidden md:block print:hidden">
            Dokumen Resmi<br />Draf Kurikulum
          </div>
        </div>

        {/* Timetable Header Meta */}
        <div className="text-center space-y-1">
          <h2 className="text-sm font-extrabold uppercase tracking-widest text-slate-800">
            {viewMode === 'class' && `JADWAL PELAJARAN KELAS ${classes.find(c => c.id === selectedClassId)?.name || ''}`}
            {viewMode === 'teacher' && `JADWAL MENGAJAR GURU ${teachers.find(t => t.id === selectedTeacherId)?.name?.toUpperCase() || ''}`}
            {viewMode === 'master' && 'MASTER JADWAL PELAJARAN SEKOLAH (ALL)'}
            {viewMode === 'recap' && 'REKAPITULASI PEMBAGIAN JAM MENGAJAR GURU & DAFTAR REFERENSI KODE'}
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Tahun Ajaran: {config.tahunAjaran} | Semester: {config.semester}
          </p>
        </div>

        {/* Timetable Grid */}
        <div className="overflow-x-auto">
          {slots.length === 0 ? (
            <div className="py-12 text-center text-slate-400 border border-dashed border-slate-200 rounded-xl">
              <HelpCircle className="w-10 h-10 mx-auto text-slate-300 mb-2 animate-bounce" />
              <h4 className="font-bold text-sm text-slate-700">Draf Jadwal Masih Kosong</h4>
              <p className="text-xs text-slate-500 mt-1">Silakan susun jadwal terlebih dahulu di menu "Generate AI" untuk melihat pratinjau cetak.</p>
            </div>
          ) : viewMode === 'recap' ? (
            <div className="space-y-8 text-left text-slate-800">
              {/* Section 1: Rekapitulasi Mengajar */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider mb-2 border-b border-slate-300 pb-1 text-indigo-900 print:text-black flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-indigo-600 print:hidden shrink-0" />
                  I. Rekapitulasi Alokasi Jam Mengajar Guru (Target JP vs Terjadwal)
                </h3>
                <table className="w-full border-collapse border-2 border-slate-800 text-xs text-left">
                  <thead>
                    <tr className="bg-slate-100 border-b-2 border-slate-800 font-bold text-slate-900">
                      <th className="border-r-2 border-slate-800 py-2.5 px-3 w-16 text-center">Kode</th>
                      <th className="border-r-2 border-slate-800 py-2.5 px-3">Nama Lengkap Guru</th>
                      <th className="border-r-2 border-slate-800 py-2.5 px-3">Mata Pelajaran & Rombel Diampu</th>
                      <th className="border-r-2 border-slate-800 py-2.5 px-3 text-center w-28">Target Beban</th>
                      <th className="border-r-2 border-slate-800 py-2.5 px-3 text-center w-28">Terjadwal</th>
                      <th className="py-2.5 px-3 text-center w-36">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-400">
                    {teachers.map((teacher) => {
                      const stats = getTeacherStats(teacher.id);
                      return (
                        <tr key={teacher.id} className="hover:bg-slate-50/50">
                          <td className="border-r-2 border-slate-800 py-2.5 px-3 font-mono font-bold text-center bg-slate-50">
                            {teacher.code}
                          </td>
                          <td className="border-r-2 border-slate-800 py-2.5 px-3">
                            <div className="font-bold">{teacher.name}</div>
                            <div className="text-[10px] text-slate-500 font-mono">NIP: {teacher.nip || '-'}</div>
                          </td>
                          <td className="border-r-2 border-slate-800 py-2.5 px-3">
                            {stats.subjectsAndClasses.length === 0 ? (
                              <span className="text-xs italic text-slate-400">Belum ada penugasan mengajar</span>
                            ) : (
                              <div className="flex flex-wrap gap-1">
                                {stats.subjectsAndClasses.map((item, idx) => (
                                  <span key={idx} className="inline-block bg-slate-100 text-slate-700 text-[10px] font-medium px-2 py-0.5 rounded border border-slate-200 print:border-none print:bg-transparent print:p-0">
                                    {item}{idx < stats.subjectsAndClasses.length - 1 ? '; ' : ''}
                                  </span>
                                ))}
                              </div>
                            )}
                          </td>
                          <td className="border-r-2 border-slate-800 py-2.5 px-3 text-center font-bold">
                            {stats.totalAssignedJP} JP
                          </td>
                          <td className="border-r-2 border-slate-800 py-2.5 px-3 text-center font-extrabold text-indigo-800 print:text-black bg-indigo-50/10">
                            {stats.scheduledJP} JP
                          </td>
                          <td className="py-2.5 px-3 text-center font-bold">
                            {stats.status === 'MATCH' ? (
                              <span className="text-emerald-700 print:text-black">100% Sesuai</span>
                            ) : stats.status === 'OVER' ? (
                              <span className="text-rose-700 font-extrabold print:text-black">Berlebih (+{stats.scheduledJP - stats.totalAssignedJP} JP)</span>
                            ) : (
                              <span className="text-amber-700 font-extrabold print:text-black">Belum Lengkap ({stats.scheduledJP}/{stats.totalAssignedJP})</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Section 2: Referensi Kode */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 page-break-before-auto">
                {/* Kode Guru */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider mb-2 border-b border-slate-300 pb-1 text-indigo-900 print:text-black flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-indigo-600 print:hidden shrink-0" />
                    II. Daftar Referensi Kode & Nama Guru
                  </h3>
                  <table className="w-full border-collapse border-2 border-slate-800 text-xs text-left">
                    <thead>
                      <tr className="bg-slate-100 border-b-2 border-slate-800 font-bold text-slate-900">
                        <th className="border-r-2 border-slate-800 py-2 px-3 w-20 text-center">Kode Guru</th>
                        <th className="border-r-2 border-slate-800 py-2 px-3">Nama Lengkap Guru</th>
                        <th className="py-2 px-3">NIP</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-400">
                      {teachers.map((t) => (
                        <tr key={t.id} className="hover:bg-slate-50/50">
                          <td className="border-r-2 border-slate-800 py-2 px-3 font-mono font-bold text-center bg-slate-50">
                            {t.code}
                          </td>
                          <td className="border-r-2 border-slate-800 py-2 px-3 font-bold">
                            {t.name}
                          </td>
                          <td className="py-2 px-3 font-mono">
                            {t.nip && t.nip !== '-' ? t.nip : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Kode Mapel */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider mb-2 border-b border-slate-300 pb-1 text-indigo-900 print:text-black flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-indigo-600 print:hidden shrink-0" />
                    III. Daftar Referensi Kode & Nama Mata Pelajaran (Mapel)
                  </h3>
                  <table className="w-full border-collapse border-2 border-slate-800 text-xs text-left">
                    <thead>
                      <tr className="bg-slate-100 border-b-2 border-slate-800 font-bold text-slate-900">
                        <th className="border-r-2 border-slate-800 py-2 px-3 w-24 text-center">Kode Mapel</th>
                        <th className="py-2 px-3">Nama Mata Pelajaran</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-400">
                      {subjects.map((s) => (
                        <tr key={s.id} className="hover:bg-slate-50/50">
                          <td className="border-r-2 border-slate-800 py-2 px-3 font-mono font-bold text-center bg-slate-50">
                            {s.code}
                          </td>
                          <td className="py-2 px-3 font-bold">
                            {s.name}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <table className="w-full text-center border-collapse border-2 border-slate-800 text-xs font-sans">
              <thead>
                <tr className="bg-slate-100 border-b-2 border-slate-800 font-bold text-slate-900">
                  <th className="border-r-2 border-slate-800 py-3 px-1.5 w-16">Waktu</th>
                  <th className="border-r-2 border-slate-800 py-3 px-1">Jam Ke</th>
                  {days.map(day => (
                    <th key={day} className="border-r-2 border-slate-800 py-3 px-2 w-32 uppercase tracking-wider">{day}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300">
                {timeSlots.map((slot) => {
                  if (slot.isBreak) {
                    if (!slot.day) {
                      return (
                        <tr key={slot.id} className="bg-slate-50 font-bold border-y-2 border-slate-800 text-[10px] italic">
                          <td className="border-r-2 border-slate-800 py-2 font-semibold font-mono">{slot.startTime} - {slot.endTime}</td>
                          <td className="border-r-2 border-slate-800 py-2">-</td>
                          <td colSpan={days.length} className="py-2 text-center text-slate-500 uppercase tracking-widest bg-slate-100/80">
                            --- {slot.label || 'Istirahat'} ---
                          </td>
                        </tr>
                      );
                    }

                    // Day-specific activity (like Monday Ceremony)
                    return (
                      <tr key={slot.id} className="hover:bg-slate-50/50 transition font-bold border-y-2 border-slate-800 text-[10px] italic">
                        <td className="border-r-2 border-slate-800 py-3 font-semibold font-mono bg-slate-50/30">
                          {slot.startTime} - {slot.endTime}
                        </td>
                        <td className="border-r-2 border-slate-800 py-3 font-bold text-slate-800 bg-slate-50/50">
                          -
                        </td>
                        {days.map(day => {
                          const isMatch = day === slot.day;
                          if (isMatch) {
                            return (
                              <td key={day} className="border-r-2 border-slate-800 py-3 px-1.5 font-bold text-purple-900 bg-purple-50 align-middle uppercase tracking-widest text-[9px]">
                                {slot.label || 'Kegiatan'}
                              </td>
                            );
                          }
                          return (
                            <td key={day} className="border-r-2 border-slate-800 py-3 px-1.5 font-normal text-slate-300 align-middle">
                              -
                            </td>
                          );
                        })}
                      </tr>
                    );
                  }

                  return (
                    <tr key={slot.id} className="hover:bg-slate-50/50 transition">
                      <td className="border-r-2 border-slate-800 py-3 font-semibold font-mono bg-slate-50/30">
                        {slot.startTime} - {slot.endTime}
                      </td>
                      <td className="border-r-2 border-slate-800 py-3 font-bold text-slate-800 bg-slate-50/50">
                        {slot.period}
                      </td>
                      {days.map(day => {
                        let text = '';
                        if (viewMode === 'class') {
                          text = getSlotContentForClass(selectedClassId, day, slot.period);
                        } else if (viewMode === 'teacher') {
                          text = getSlotContentForTeacher(selectedTeacherId, day, slot.period);
                        } else {
                          // Master Board view - list classes
                          const classListText = classes.map(c => {
                            const ct = getSlotContentForClass(c.id, day, slot.period);
                            return ct ? `${c.name}: ${ct}` : '';
                          }).filter(Boolean).join(' | ');
                          text = classListText;
                        }

                        return (
                          <td key={day} className="border-r-2 border-slate-800 py-3 px-1.5 font-bold text-slate-800 align-middle">
                            {text ? (
                              <div className="bg-slate-50 p-1.5 rounded border border-slate-200 shadow-sm text-center print:bg-transparent print:border-none print:shadow-none min-h-[25px] flex items-center justify-center">
                                {text}
                              </div>
                            ) : (
                              <span className="text-slate-300 font-normal">-</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Document Signing Authority Blocks (Official bottom block) */}
        {slots.length > 0 && (
          <div className="grid grid-cols-2 pt-10 text-xs font-medium text-slate-800">
            <div className="text-center space-y-16">
              <div>
                <p>Mengetahui,</p>
                <p className="font-bold">Kepala Sekolah {config.jenjang} {config.namaInstansi}</p>
              </div>
              <div className="space-y-0.5">
                <p className="font-bold underline">{config.namaKepalaSekolah}</p>
                <p className="text-[10px] text-slate-500 font-mono">NIP. {config.nipKepalaSekolah}</p>
              </div>
            </div>

            <div className="text-center space-y-16">
              <div>
                <p>{config.kota}, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                <p className="font-bold">Waka Kurikulum</p>
              </div>
              <div className="space-y-0.5">
                <p className="font-bold underline">{config.namaWakaKurikulum}</p>
                <p className="text-[10px] text-slate-500 font-mono">NIP. {config.nipWakaKurikulum}</p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
