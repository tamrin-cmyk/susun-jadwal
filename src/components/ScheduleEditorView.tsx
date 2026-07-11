import React, { useState } from 'react';
import { ScheduleSlot, Assignment, Teacher, Subject, ClassItem, TimeSlot, SchoolConfig, ScheduleConflict } from '../types';
import { Landmark, Calendar, AlertTriangle, Check, Trash2, Plus, HelpCircle, Save, Info } from 'lucide-react';
import { Modal } from './ui/Dialog';

interface ScheduleEditorViewProps {
  config: SchoolConfig;
  slots: ScheduleSlot[];
  assignments: Assignment[];
  teachers: Teacher[];
  subjects: Subject[];
  classes: ClassItem[];
  timeSlots: TimeSlot[];
  days: string[];
  onUpdateSlots: (newSlots: ScheduleSlot[]) => void;
  conflicts: ScheduleConflict[];
}

export default function ScheduleEditorView({
  config,
  slots,
  assignments,
  teachers,
  subjects,
  classes,
  timeSlots,
  days,
  onUpdateSlots,
  conflicts
}: ScheduleEditorViewProps) {
  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || '');
  
  // Modal state for editing a single slot
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeCell, setActiveCell] = useState<{ day: string; period: number } | null>(null);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string>('');

  const activePeriods = timeSlots.filter(t => !t.isBreak).map(t => t.period);

  // Helper Lookups
  const getAssignmentInfo = (assignmentId: string) => {
    if (!assignmentId) return null;
    const assign = assignments.find(a => a.id === assignmentId);
    if (!assign) return null;
    
    const teacher = teachers.find(t => t.id === assign.teacherId);
    const subject = subjects.find(s => s.id === assign.subjectId);

    return {
      id: assign.id,
      teacherId: teacher?.id || '',
      teacherCode: teacher?.code || '?',
      teacherName: teacher?.name || '?',
      subjectCode: subject?.code || '?',
      subjectName: subject?.name || '?',
      hoursPerWeek: assign.hoursPerWeek
    };
  };

  const getSlotForCell = (day: string, period: number) => {
    return slots.find(s => s.classId === selectedClassId && s.day === day && s.period === period);
  };

  // Check double booking for any teacher at a specific day and period (excluding current class)
  const checkTeacherDoubleBooking = (teacherId: string, day: string, period: number) => {
    return slots.find(s => {
      if (s.classId === selectedClassId || !s.assignmentId || s.assignmentId === 'BREAK') return false;
      const assign = assignments.find(a => a.id === s.assignmentId);
      return assign && assign.teacherId === teacherId && s.day === day && s.period === period;
    });
  };

  // Get current assigned hours for an assignment in the whole schedule
  const getAssignedHoursForAssignment = (assignmentId: string) => {
    return slots.filter(s => s.assignmentId === assignmentId).length;
  };

  // Handle cell click
  const handleCellClick = (day: string, period: number) => {
    const isHoliday = (config.offDays || []).includes(day);
    if (isHoliday) return; // Cannot edit holiday slots

    setActiveCell({ day, period });
    const currentSlot = getSlotForCell(day, period);
    setSelectedAssignmentId(currentSlot?.assignmentId || '');
    setIsEditModalOpen(true);
  };

  // Save the slot update
  const handleSaveSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCell) return;

    const { day, period } = activeCell;
    
    // Check if the slot already exists in state
    const existingSlotIndex = slots.findIndex(
      s => s.classId === selectedClassId && s.day === day && s.period === period
    );

    let newSlots = [...slots];

    const updatedSlot: ScheduleSlot = {
      classId: selectedClassId,
      day,
      period,
      assignmentId: selectedAssignmentId
    };

    if (existingSlotIndex >= 0) {
      newSlots[existingSlotIndex] = updatedSlot;
    } else {
      newSlots.push(updatedSlot);
    }

    onUpdateSlots(newSlots);
    setIsEditModalOpen(false);
    setActiveCell(null);
  };

  // Empty all slots for the selected class
  const handleResetClassSchedule = () => {
    if (window.confirm('Apakah Anda yakin ingin mengosongkan seluruh draf jadwal untuk kelas ini saja?')) {
      const filteredSlots = slots.filter(s => s.classId !== selectedClassId);
      
      // Re-populate blank slots for active periods of this class
      const blankSlots: ScheduleSlot[] = [];
      for (const d of days) {
        const isHoliday = (config.offDays || []).includes(d);
        if (isHoliday) continue;
        for (const p of activePeriods) {
          blankSlots.push({
            classId: selectedClassId,
            day: d,
            period: p,
            assignmentId: ""
          });
        }
      }
      onUpdateSlots([...filteredSlots, ...blankSlots]);
    }
  };

  // Filters assignments for the currently selected class
  const classAssignments = assignments.filter(a => a.classId === selectedClassId);

  // Conflicts related only to the selected class
  const classConflicts = conflicts.filter(cf => cf.classId === selectedClassId || (cf.teacherId && classAssignments.some(a => a.teacherId === cf.teacherId && cf.day)));

  return (
    <div id="schedule-editor-view" className="space-y-6">
      
      {/* Top Selector Panel */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800">Sistem Penyesuaian Jadwal Manual</h2>
            <p className="text-xs text-slate-500 mt-0.5">Edit dan sesuaikan draf KBM dwi-kelas secara langsung. Dilengkapi asisten pintar validator bentrok.</p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto">
          <div>
            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">Rombel Aktif</label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="px-3 py-2 text-xs font-bold border border-slate-200 rounded-lg bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              {classes.map(c => (
                <option key={c.id} value={c.id}>Kelas {c.name}</option>
              ))}
            </select>
          </div>

          <button
            onClick={handleResetClassSchedule}
            className="mt-4 px-3.5 py-2 text-xs font-bold border border-rose-200 hover:border-rose-300 text-rose-600 hover:bg-rose-50 rounded-lg transition flex items-center space-x-1.5"
            title="Kosongkan jadwal kelas"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">Reset Rombel</span>
          </button>
        </div>
      </div>

      {/* Grid Layout & Editor Container */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Timetable Grid View (Colspan 3) */}
        <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-slate-100 p-6 overflow-x-auto">
          <div className="min-w-[650px] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest flex items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 mr-2"></span>
                Matriks Jadwal: {classes.find(c => c.id === selectedClassId)?.name}
              </h3>
              <span className="text-[10px] text-slate-400 italic">Klik pada kotak slot aktif untuk menugaskan pelajaran.</span>
            </div>

            <table className="w-full text-center border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-2.5 px-2 w-20 text-left">Waktu</th>
                  <th className="py-2.5 px-2 w-14">Jam</th>
                  {days.map(day => {
                    const isHoliday = (config.offDays || []).includes(day);
                    return (
                      <th key={day} className={`py-2.5 px-2 w-28 uppercase tracking-widest ${isHoliday ? 'text-rose-400 font-extrabold bg-rose-50/20' : ''}`}>
                        {day}
                        {isHoliday && <span className="block text-[8px] text-rose-500 lowercase font-normal italic">(libur)</span>}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {timeSlots.map((slot) => {
                  if (slot.isBreak) {
                    return (
                      <tr key={slot.id} className="bg-amber-50/10 font-bold italic text-slate-400 border-y border-slate-100">
                        <td className="py-2 px-2 text-left font-mono text-[10px]">{slot.startTime} - {slot.endTime}</td>
                        <td className="py-2 px-2">-</td>
                        <td colSpan={days.length} className="py-2 bg-slate-50/60 uppercase tracking-widest text-[9px] text-slate-400">
                          {slot.label || 'Istirahat'}
                        </td>
                      </tr>
                    );
                  }

                  return (
                    <tr key={slot.id} className="hover:bg-slate-50/30 transition">
                      <td className="py-3 px-2 text-left font-semibold text-slate-500 font-mono text-[10px]">
                        {slot.startTime} - {slot.endTime}
                      </td>
                      <td className="py-3 px-2 font-bold text-slate-700 bg-slate-50/50">
                        {slot.period}
                      </td>
                      {days.map(day => {
                        const isHoliday = (config.offDays || []).includes(day);
                        const cellSlot = getSlotForCell(day, slot.period);
                        const assignmentInfo = cellSlot ? getAssignmentInfo(cellSlot.assignmentId) : null;

                        if (isHoliday) {
                          return (
                            <td key={day} className="py-3 px-1.5 bg-rose-50/20 border-r border-slate-100/50 align-middle">
                              <span className="inline-block bg-rose-50 text-rose-600 border border-rose-100 rounded text-[9px] font-extrabold px-2 py-1 tracking-wider uppercase">
                                LIBUR
                              </span>
                            </td>
                          );
                        }

                        // Check if this specific slot has any conflict
                        const cellConflict = conflicts.find(
                          cf => cf.classId === selectedClassId && cf.day === day && cf.period === slot.period
                        );

                        return (
                          <td 
                            key={day} 
                            onClick={() => handleCellClick(day, slot.period)}
                            className="py-2.5 px-1.5 align-middle border-r border-slate-50 last:border-0 cursor-pointer group"
                          >
                            {assignmentInfo ? (
                              <div className={`p-2 rounded-xl border text-left transition-all shadow-sm relative overflow-hidden ${
                                cellConflict 
                                  ? 'bg-rose-50 border-rose-200 hover:border-rose-300' 
                                  : 'bg-indigo-50/40 border-indigo-100/70 hover:border-indigo-200 hover:bg-indigo-50/80'
                              }`}>
                                <div className="flex items-center justify-between">
                                  <span className="font-extrabold text-indigo-900 text-[10px] tracking-tight truncate">
                                    {assignmentInfo.subjectCode}
                                  </span>
                                  {cellConflict && (
                                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>
                                  )}
                                </div>
                                <div className="text-[9px] text-slate-500 font-bold mt-1 truncate">
                                  Guru: {assignmentInfo.teacherCode}
                                </div>
                              </div>
                            ) : (
                              <div className="border border-dashed border-slate-200 group-hover:border-indigo-300 group-hover:bg-indigo-50/10 rounded-xl p-2.5 text-center text-slate-300 group-hover:text-indigo-500 transition-all flex flex-col items-center justify-center min-h-[50px]">
                                <Plus className="w-3.5 h-3.5 opacity-60 group-hover:scale-110 transition-transform" />
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Auditor & Conflict Alert Sidebar (Colspan 1) */}
        <div className="lg:col-span-1 space-y-5">
          
          {/* Class Statistics Tracker */}
          <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 mr-2"></span>
              Alokasi JP Mengajar
            </h3>

            <div className="space-y-3.5 max-h-72 overflow-y-auto pr-1">
              {classAssignments.length === 0 ? (
                <p className="text-xs text-slate-400 italic text-center py-4">Belum ada beban penugasan yang dibuat untuk kelas ini.</p>
              ) : (
                classAssignments.map(assign => {
                  const info = getAssignmentInfo(assign.id);
                  const scheduledHours = getAssignedHoursForAssignment(assign.id);
                  const isPerfect = scheduledHours === assign.hoursPerWeek;
                  const isExceeded = scheduledHours > assign.hoursPerWeek;

                  return (
                    <div key={assign.id} className="text-xs space-y-1 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <div className="flex items-center justify-between font-bold text-slate-700">
                        <span className="truncate max-w-[120px]">{info?.subjectName}</span>
                        <span className="font-mono text-[10px] bg-slate-200/50 px-1.5 py-0.5 rounded text-slate-600">
                          {info?.teacherCode}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                        <span>Terjadwal:</span>
                        <span className={`font-bold ${isPerfect ? 'text-emerald-600' : isExceeded ? 'text-rose-600' : 'text-amber-600'}`}>
                          {scheduledHours} / {assign.hoursPerWeek} JP
                        </span>
                      </div>

                      {/* Micro Progress Bar */}
                      <div className="w-full bg-slate-200 h-1 rounded overflow-hidden">
                        <div 
                          className={`h-full rounded transition-all ${
                            isPerfect ? 'bg-emerald-500' : isExceeded ? 'bg-rose-500' : 'bg-amber-400'
                          }`}
                          style={{ width: `${Math.min(100, (scheduledHours / assign.hoursPerWeek) * 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Conflict Auditor specific to current selection */}
          <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-600 mr-2"></span>
              Pemeriksa Bentrok Kelas
            </h3>

            {classConflicts.length === 0 ? (
              <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-lg text-xs flex items-start space-x-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed">Tidak ada bentrok atau kelebihan beban mengajar untuk rombel ini!</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {classConflicts.map((cf, idx) => (
                  <div key={idx} className="p-2.5 bg-rose-50 border border-rose-100 text-[11px] text-rose-800 rounded-lg flex items-start space-x-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-bold leading-none">{cf.type === 'TEACHER_DOUBLE_BOOKING' ? 'Bentrokan Guru' : 'Kelebihan JP'}</p>
                      <p className="leading-relaxed mt-1 text-[10px] text-rose-700">{cf.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Manual Slot Assignment Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Atur Jadwal: ${activeCell?.day} Jam ke-${activeCell?.period}`}
      >
        <form onSubmit={handleSaveSlot} className="space-y-5">
          
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 space-y-1">
            <p><strong>Rombongan Belajar:</strong> Kelas {classes.find(c => c.id === selectedClassId)?.name}</p>
            <p><strong>Hari / Slot:</strong> {activeCell?.day} | Jam KBM ke-{activeCell?.period}</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Pilih Pelajaran & Guru Mengajar
            </label>
            
            <div className="space-y-3">
              {/* Option 1: Empty slot */}
              <label className="flex items-start space-x-3 p-3 rounded-xl border border-slate-200 hover:border-slate-300 bg-white cursor-pointer transition">
                <input
                  type="radio"
                  name="assignment"
                  value=""
                  checked={selectedAssignmentId === ''}
                  onChange={() => setSelectedAssignmentId('')}
                  className="mt-0.5 rounded-full text-indigo-600 focus:ring-indigo-500 focus:ring-2"
                />
                <div className="text-xs">
                  <span className="font-bold text-slate-800 block">Kosongkan Slot / Jam Kosong</span>
                  <span className="text-slate-400 block mt-0.5">Tiadakan mata pelajaran di jam ini.</span>
                </div>
              </label>

              {/* Assignments options */}
              {classAssignments.map(assign => {
                const info = getAssignmentInfo(assign.id);
                if (!info) return null;

                const assignedHours = getAssignedHoursForAssignment(assign.id);
                const isCurrentAssignedToThisCell = getSlotForCell(activeCell?.day || '', activeCell?.period || 0)?.assignmentId === assign.id;
                
                // If it is already assigned to this cell, we subtract 1 from the "current" total when evaluating exceeding limit
                const effectiveAssignedHours = isCurrentAssignedToThisCell ? assignedHours - 1 : assignedHours;
                const isOverwork = effectiveAssignedHours >= assign.hoursPerWeek;

                // Double booking check
                const dbConflict = activeCell ? checkTeacherDoubleBooking(assign.teacherId, activeCell.day, activeCell.period) : null;
                const dbConflictClassName = dbConflict ? (classes.find(c => c.id === dbConflict.classId)?.name || 'Kelas Lain') : '';

                return (
                  <label 
                    key={assign.id}
                    className={`flex items-start space-x-3 p-3 rounded-xl border transition cursor-pointer ${
                      selectedAssignmentId === assign.id
                        ? 'border-indigo-600 bg-indigo-50/10'
                        : dbConflict
                          ? 'border-rose-100 bg-rose-50/10 hover:border-rose-200'
                          : isOverwork
                            ? 'border-amber-100 bg-amber-50/10 hover:border-amber-200'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="assignment"
                      value={assign.id}
                      checked={selectedAssignmentId === assign.id}
                      onChange={() => setSelectedAssignmentId(assign.id)}
                      className="mt-1 rounded-full text-indigo-600 focus:ring-indigo-500 focus:ring-2"
                    />
                    
                    <div className="flex-1 text-xs">
                      <div className="flex justify-between items-baseline">
                        <span className="font-extrabold text-slate-800 block">
                          {info.subjectName} ({info.subjectCode})
                        </span>
                        <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                          {info.teacherCode}
                        </span>
                      </div>
                      
                      <div className="text-[10px] text-slate-500 mt-1">
                        Guru: {info.teacherName}
                      </div>

                      {/* Anti-Bentrok Status Badges */}
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold ${
                          isOverwork 
                            ? 'bg-amber-50 text-amber-700 border border-amber-100' 
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                        }`}>
                          Sisa Beban: {Math.max(0, assign.hoursPerWeek - effectiveAssignedHours)} dari {assign.hoursPerWeek} JP
                        </span>

                        {dbConflict && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-rose-50 text-rose-700 border border-rose-100 uppercase tracking-tight">
                            ⚠️ BENTROK GURU: Mengajar di kelas {dbConflictClassName}
                          </span>
                        )}
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="flex space-x-2 pt-4 border-t border-slate-100 mt-6">
            <button
              type="button"
              onClick={() => {
                setIsEditModalOpen(false);
                setActiveCell(null);
              }}
              className="flex-1 py-2 text-sm font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 py-2 text-sm font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center shadow-sm"
            >
              <Save className="w-4 h-4 mr-1.5" />
              Simpan Jadwal
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
