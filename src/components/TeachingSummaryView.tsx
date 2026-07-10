import React from 'react';
import { ScheduleSlot, Assignment, Teacher, Subject, ClassItem } from '../types';
import { CheckCircle2, AlertCircle, Award, Users, BookOpen, Clock } from 'lucide-react';

interface TeachingSummaryViewProps {
  slots: ScheduleSlot[];
  assignments: Assignment[];
  teachers: Teacher[];
  subjects: Subject[];
  classes: ClassItem[];
}

export default function TeachingSummaryView({
  slots,
  assignments,
  teachers,
  subjects,
  classes
}: TeachingSummaryViewProps) {

  // Calculate stats for each teacher
  const getTeacherStats = (teacherId: string) => {
    // 1. Find assigned classes & subjects
    const teacherAssigns = assignments.filter(a => a.teacherId === teacherId);
    
    // Total assigned hours
    const totalAssignedJP = teacherAssigns.reduce((sum, curr) => sum + curr.hoursPerWeek, 0);

    // 2. Find actually scheduled slots
    // Filter active slots belonging to this teacher
    const scheduledJP = slots.filter(slot => {
      if (!slot.assignmentId || slot.assignmentId === 'BREAK') return false;
      const assign = assignments.find(a => a.id === slot.assignmentId);
      return assign?.teacherId === teacherId;
    }).length;

    // Subjects and classes list
    const subjectsAndClasses = teacherAssigns.map(a => {
      const subj = subjects.find(s => s.id === a.subjectId);
      const cls = classes.find(c => c.id === a.classId);
      return `${subj?.code || 'Mapel'} di Kelas ${cls?.name || 'Kelas'} (${a.hoursPerWeek} JP)`;
    });

    return {
      totalAssignedJP,
      scheduledJP,
      subjectsAndClasses,
      status: scheduledJP === totalAssignedJP ? 'MATCH' : scheduledJP > totalAssignedJP ? 'OVER' : 'UNDER'
    };
  };

  return (
    <div id="teaching-summary-container" className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm">
        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2">Rekapitulasi Mengajar Guru</h2>
        <p className="text-xs text-slate-500">
          Ulasan komparatif antara <strong>Beban Penugasan Akademik</strong> (Target JP) dengan <strong>Alokasi Jadwal Aktif</strong> yang berhasil diplot oleh sistem.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/30">
                <th className="py-3.5 px-5">Inisial</th>
                <th className="py-3.5 px-4">Nama Lengkap Guru</th>
                <th className="py-3.5 px-4">Mata Pelajaran & Rombel Diampu</th>
                <th className="py-3.5 px-4 text-center">Beban Kerja (Target)</th>
                <th className="py-3.5 px-4 text-center">Jadwal Aktif (Terjadwal)</th>
                <th className="py-3.5 px-4 text-center">Akurasi Sinkronisasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {teachers.map((teacher) => {
                const stats = getTeacherStats(teacher.id);
                return (
                  <tr key={teacher.id} className="hover:bg-slate-50/30 transition">
                    <td className="py-4 px-5 font-mono font-bold text-indigo-600">
                      <span className="bg-indigo-50 px-2.5 py-1 rounded border border-indigo-100/50">
                        {teacher.code}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-bold text-slate-800">{teacher.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">NIP. {teacher.nip}</div>
                    </td>
                    <td className="py-4 px-4">
                      {stats.subjectsAndClasses.length === 0 ? (
                        <span className="text-xs italic text-slate-400">Belum ada penugasan mengajar</span>
                      ) : (
                        <div className="flex flex-wrap gap-1.5 max-w-md">
                          {stats.subjectsAndClasses.map((item, idx) => (
                            <span key={idx} className="inline-block bg-slate-100/80 text-slate-600 text-[10px] font-semibold px-2 py-0.5 rounded border border-slate-200/40">
                              {item}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center font-bold text-slate-700">
                      <span className="inline-flex items-center">
                        <Clock className="w-3.5 h-3.5 text-slate-400 mr-1 shrink-0" />
                        {stats.totalAssignedJP} JP
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center font-extrabold text-indigo-700">
                      <span className="inline-flex items-center bg-indigo-50/50 px-2.5 py-1 rounded border border-indigo-100/30">
                        {stats.scheduledJP} JP
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      {stats.status === 'MATCH' ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-100">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mr-1 shrink-0" />
                          Sesuai (100%)
                        </span>
                      ) : stats.status === 'OVER' ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-800 border border-rose-100">
                          <AlertCircle className="w-3.5 h-3.5 text-rose-600 mr-1 shrink-0" />
                          Berlebih
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-100">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-500 mr-1 shrink-0" />
                          Belum Lengkap
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
