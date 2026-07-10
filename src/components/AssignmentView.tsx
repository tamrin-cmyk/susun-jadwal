import React, { useState } from 'react';
import { Assignment, Teacher, Subject, ClassItem } from '../types';
import { Plus, Edit2, Trash2, Calendar, Save, ClipboardList, BookOpen, User } from 'lucide-react';

interface AssignmentViewProps {
  assignments: Assignment[];
  teachers: Teacher[];
  subjects: Subject[];
  classes: ClassItem[];
  onAdd: (assignment: Assignment) => void;
  onUpdate: (assignment: Assignment) => void;
  onDelete: (id: string) => void;
}

export default function AssignmentView({
  assignments,
  teachers,
  subjects,
  classes,
  onAdd,
  onUpdate,
  onDelete
}: AssignmentViewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('ALL');

  const [formData, setFormData] = useState<Omit<Assignment, 'id'>>({
    teacherId: '',
    subjectId: '',
    classId: '',
    hoursPerWeek: 4
  });

  const resetForm = () => {
    setFormData({
      teacherId: '',
      subjectId: '',
      classId: '',
      hoursPerWeek: 4
    });
    setIsEditing(false);
    setCurrentId(null);
  };

  const handleEdit = (assign: Assignment) => {
    setIsEditing(true);
    setCurrentId(assign.id);
    setFormData({
      teacherId: assign.teacherId,
      subjectId: assign.subjectId,
      classId: assign.classId,
      hoursPerWeek: assign.hoursPerWeek
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tId = formData.teacherId || (teachers[0]?.id || '');
    const sId = formData.subjectId || (subjects[0]?.id || '');
    const cId = formData.classId || (classes[0]?.id || '');

    if (isEditing && currentId) {
      onUpdate({
        id: currentId,
        teacherId: tId,
        subjectId: sId,
        classId: cId,
        hoursPerWeek: formData.hoursPerWeek
      });
    } else {
      onAdd({
        id: `a-${Date.now()}`,
        teacherId: tId,
        subjectId: sId,
        classId: cId,
        hoursPerWeek: formData.hoursPerWeek
      });
    }
    resetForm();
  };

  // Lookups
  const getTeacherName = (id: string) => {
    const t = teachers.find(item => item.id === id);
    return t ? `${t.name} (${t.code})` : 'Tidak Diketahui';
  };

  const getSubjectName = (id: string) => {
    const s = subjects.find(item => item.id === id);
    return s ? `${s.name} (${s.code})` : 'Tidak Diketahui';
  };

  const getClassName = (id: string) => {
    const c = classes.find(item => item.id === id);
    return c ? c.name : 'Tidak Diketahui';
  };

  // Filter assignments
  const filteredAssignments = selectedClassFilter === 'ALL'
    ? assignments
    : assignments.filter(a => a.classId === selectedClassFilter);

  // Grouped counts for easy auditing
  const totalJPForClass = (classId: string) => {
    return assignments
      .filter(a => a.classId === classId)
      .reduce((sum, curr) => sum + curr.hoursPerWeek, 0);
  };

  return (
    <div id="assignment-view-container" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Form Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 h-fit">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center">
          {isEditing ? (
            <>
              <Edit2 className="w-4 h-4 mr-2 text-indigo-600" />
              Edit Beban Penugasan
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-2 text-indigo-600" />
              Beban Penugasan Baru
            </>
          )}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Pilih Guru</label>
            <select
              required
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              value={formData.teacherId}
              onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
            >
              <option value="">-- Pilih Guru --</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Pilih Mata Pelajaran</label>
            <select
              required
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              value={formData.subjectId}
              onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
            >
              <option value="">-- Pilih Mapel --</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.code}) - {s.kelompok === 'C' ? 'DKV' : 'Umum'}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Pilih Kelas Sasaran</label>
            <select
              required
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              value={formData.classId}
              onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
            >
              <option value="">-- Pilih Kelas --</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} (Wali: {getTeacherName(c.waliKelasId).split(' (')[0]})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Jumlah Jam Mengajar (JP per Minggu)</label>
            <input
              type="number"
              min={1}
              max={12}
              required
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              value={formData.hoursPerWeek}
              onChange={(e) => setFormData({ ...formData, hoursPerWeek: parseInt(e.target.value) || 0 })}
            />
            <p className="text-[10px] text-slate-400 mt-1">E.g., Mapel Kejuruan biasanya 4-6 JP, sedangkan Mapel Umum 2-3 JP.</p>
          </div>

          <div className="flex space-x-2 pt-2">
            {isEditing && (
              <button
                type="button"
                onClick={resetForm}
                className="flex-1 py-2 text-sm font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition"
              >
                Batal
              </button>
            )}
            <button
              type="submit"
              className="flex-1 py-2 text-sm font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center justify-center shadow-sm"
            >
              <Save className="w-4 h-4 mr-1.5" />
              {isEditing ? 'Simpan' : 'Tugaskan'}
            </button>
          </div>
        </form>
      </div>

      {/* List & Audit Card */}
      <div className="lg:col-span-2 space-y-4">
        {/* Class JP Audit Alert */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
          {classes.map(cls => {
            const jpSum = totalJPForClass(cls.id);
            const isIdeal = jpSum >= 28 && jpSum <= 40;
            return (
              <div key={cls.id} className="bg-white p-3 rounded-lg shadow-sm border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400">Total Jam {cls.name}</span>
                <div className="flex items-baseline space-x-1.5 mt-1">
                  <span className={`text-xl font-bold ${isIdeal ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {jpSum}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">/ 40 JP</span>
                </div>
                <div className="mt-1">
                  <span className={`inline-block w-2 h-2 rounded-full mr-1.5 ${isIdeal ? 'bg-emerald-500' : 'bg-amber-400'}`}></span>
                  <span className="text-[9px] font-medium text-slate-500">
                    {jpSum === 0 ? 'Kosong' : isIdeal ? 'Sesuai Rombel' : 'Jam Sedikit'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Master List Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
            <div>
              <h2 className="text-sm font-bold text-slate-800">Petunjuk Distribusi Beban Mengajar</h2>
              <p className="text-xs text-slate-500">Mengaitkan Guru dengan Mata Pelajaran pada kelas tertentu.</p>
            </div>
            
            {/* Class Filter Dropdown */}
            <select
              value={selectedClassFilter}
              onChange={(e) => setSelectedClassFilter(e.target.value)}
              className="px-3 py-1.5 text-xs font-semibold border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="ALL">Semua Kelas</option>
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/30">
                  <th className="py-3 px-4">Kelas</th>
                  <th className="py-3 px-4">Guru Pengajar</th>
                  <th className="py-3 px-4">Mata Pelajaran</th>
                  <th className="py-3 px-4 text-center">Beban</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredAssignments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      <ClipboardList className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                      Tidak ada penugasan guru yang cocok.
                    </td>
                  </tr>
                ) : (
                  filteredAssignments.map((assign) => (
                    <tr key={assign.id} className="hover:bg-slate-50/50 transition">
                      <td className="py-3 px-4 font-bold text-slate-800">{getClassName(assign.classId)}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <User className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                          <span className="font-medium text-slate-700">{getTeacherName(assign.teacherId)}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <BookOpen className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="text-slate-600">{getSubjectName(assign.subjectId)}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-slate-700">
                        <span className="bg-slate-100 px-2.5 py-1 rounded text-xs">
                          {assign.hoursPerWeek} JP
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex justify-end space-x-1.5">
                          <button
                            onClick={() => handleEdit(assign)}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Hapus beban penugasan ini?`)) {
                                onDelete(assign.id);
                              }
                            }}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-md transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
