import React, { useState } from 'react';
import { Assignment, Teacher, Subject, ClassItem } from '../types';
import { Plus, Edit2, Trash2, Calendar, Save, ClipboardList, BookOpen, User, AlertTriangle } from 'lucide-react';
import { Modal, ConfirmDialog } from './ui/Dialog';

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('ALL');

  const [formData, setFormData] = useState<Omit<Assignment, 'id'>>({
    teacherId: '',
    subjectId: '',
    classId: '',
    hoursPerWeek: 4
  });

  // State for deletion
  const [assignmentToDelete, setAssignmentToDelete] = useState<{ id: string; name: string } | null>(null);

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

  const handleAddNew = () => {
    resetForm();
    setIsModalOpen(true);
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
    setIsModalOpen(true);
  };

  const handleDeleteClick = (assign: Assignment) => {
    const teacher = teachers.find(t => t.id === assign.teacherId);
    const subject = subjects.find(s => s.id === assign.subjectId);
    const cls = classes.find(c => c.id === assign.classId);
    const name = `${teacher?.name || 'Guru'} mengampu ${subject?.code || 'Mapel'} di ${cls?.name || 'Kelas'}`;

    setAssignmentToDelete({ id: assign.id, name });
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (assignmentToDelete) {
      onDelete(assignmentToDelete.id);
      setAssignmentToDelete(null);
    }
  };

  // Grouped counts for easy auditing
  const totalJPForClass = (classId: string) => {
    return assignments
      .filter(a => a.classId === classId)
      .reduce((sum, curr) => sum + curr.hoursPerWeek, 0);
  };

  // Validation checking for exceeds 50 JP
  const targetClassId = formData.classId || (classes[0]?.id || '');
  const currentClassJP = totalJPForClass(targetClassId);
  const existingAssign = assignments.find(a => a.id === currentId);
  const oldJP = existingAssign ? existingAssign.hoursPerWeek : 0;
  const newClassTotal = currentClassJP - oldJP + formData.hoursPerWeek;
  const isExceedingLimit = newClassTotal > 50;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tId = formData.teacherId || (teachers[0]?.id || '');
    const sId = formData.subjectId || (subjects[0]?.id || '');
    const cId = formData.classId || (classes[0]?.id || '');

    if (isExceedingLimit) {
      if (!window.confirm(`Perhatian: Total JP untuk kelas ini akan melebihi batas maksimal toleransi 50 JP seminggu (Menjadi ${newClassTotal} JP). Tetap simpan?`)) {
        return;
      }
    }

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
    setIsModalOpen(false);
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

  return (
    <div id="assignment-view-container" className="space-y-6">
      {/* Class JP Audit Alert Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {classes.map(cls => {
          const jpSum = totalJPForClass(cls.id);
          const isIdeal = jpSum >= 28 && jpSum <= 48;
          const isTolerable = jpSum > 48 && jpSum <= 50;
          const isExceeded = jpSum > 50;
          return (
            <div key={cls.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Total Jam {cls.name}</span>
                <div className="flex items-baseline space-x-1.5 mt-1">
                  <span className={`text-2xl font-extrabold ${isIdeal ? 'text-indigo-600' : isTolerable ? 'text-amber-600' : isExceeded ? 'text-rose-600' : 'text-slate-600'}`}>
                    {jpSum}
                  </span>
                  <span className="text-xs font-semibold text-slate-400">/ 50 JP seminggu</span>
                </div>
              </div>
              <div className="mt-3 pt-2.5 border-t border-slate-50 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-medium">Batas Maksimal 50 Jam</span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  isIdeal ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 
                  isTolerable ? 'bg-amber-50 text-amber-700 border border-amber-100' : 
                  isExceeded ? 'bg-rose-50 text-rose-700 border border-rose-100' : 
                  'bg-slate-50 text-slate-700 border border-slate-100'
                }`}>
                  <span className={`w-1 h-1 rounded-full mr-1.5 ${
                    isIdeal ? 'bg-emerald-500' : 
                    isTolerable ? 'bg-amber-500 animate-pulse' : 
                    'bg-rose-500 animate-bounce'
                  }`}></span>
                  {jpSum === 0 ? 'Belum Diisi' : isIdeal ? 'Aman (<=48 JP)' : isTolerable ? 'Maksimal (50 JP)' : 'Melebihi Batas'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Master List Table Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-50/50">
          <div>
            <h2 className="text-base font-bold text-slate-800">Petunjuk Distribusi Beban Mengajar</h2>
            <p className="text-xs text-slate-500 mt-0.5">Petakan pembagian jam pelajaran (JP) untuk setiap guru di kelas sasaran yang sesuai.</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {/* Class Filter Dropdown */}
            <select
              value={selectedClassFilter}
              onChange={(e) => setSelectedClassFilter(e.target.value)}
              className="px-3 py-2 text-xs font-semibold border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-700"
            >
              <option value="ALL">Semua Kelas</option>
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>

            <button
              onClick={handleAddNew}
              className="inline-flex items-center justify-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm transition"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Tugaskan Guru
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/30">
                <th className="py-3.5 px-6">Kelas</th>
                <th className="py-3.5 px-6">Guru Pengajar</th>
                <th className="py-3.5 px-6">Mata Pelajaran</th>
                <th className="py-3.5 px-6 text-center">Beban Mengajar</th>
                <th className="py-3.5 px-6 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredAssignments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <ClipboardList className="w-10 h-10 mx-auto text-slate-300 mb-2.5" />
                    <p className="font-semibold text-slate-600">Belum ada distribusi penugasan</p>
                    <p className="text-xs text-slate-400 mt-0.5">Silakan tugaskan guru pertama Anda untuk mulai menyusun jadwal.</p>
                  </td>
                </tr>
              ) : (
                filteredAssignments.map((assign) => (
                  <tr key={assign.id} className="hover:bg-slate-50/40 transition">
                    <td className="py-3.5 px-6">
                      <span className="font-bold text-slate-800">{getClassName(assign.classId)}</span>
                    </td>
                    <td className="py-3.5 px-6">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-indigo-500 shrink-0" />
                        <span className="font-semibold text-slate-700">{getTeacherName(assign.teacherId)}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-6">
                      <div className="flex items-center space-x-2">
                        <BookOpen className="w-4 h-4 text-slate-400 shrink-0" />
                        <span className="text-slate-600 font-medium">{getSubjectName(assign.subjectId)}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-6 text-center font-bold text-slate-700">
                      <span className="inline-flex items-center px-2.5 py-1 bg-slate-50 rounded-lg text-xs font-bold text-slate-700 border border-slate-100">
                        {assign.hoursPerWeek} JP / Minggu
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <div className="flex justify-end space-x-1.5">
                        <button
                          onClick={() => handleEdit(assign)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(assign)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Hapus"
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

      {/* Elegant Modal Form */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditing ? 'Edit Distribusi Penugasan' : 'Tugaskan Guru Baru'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Pilih Guru Pengajar</label>
            <select
              required
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800"
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
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800"
              value={formData.subjectId}
              onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
            >
              <option value="">-- Pilih Mapel --</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.code}) - {s.kelompok === 'C' ? 'Kejuruan DKV' : 'Umum'}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Pilih Kelas Sasaran</label>
            <select
              required
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800"
              value={formData.classId}
              onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
            >
              <option value="">-- Pilih Kelas --</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Jumlah Jam Pelajaran (JP per Minggu)</label>
            <input
              type="number"
              min={1}
              max={12}
              required
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800"
              value={formData.hoursPerWeek}
              onChange={(e) => setFormData({ ...formData, hoursPerWeek: parseInt(e.target.value) || 0 })}
            />
            <p className="text-[10px] text-slate-400 mt-1">E.g., Mapel Kejuruan biasanya 4-6 JP, sedangkan Mapel Umum 2-3 JP.</p>
          </div>

          {/* Alert Warnings */}
          {formData.classId && (
            <div className={`p-3 rounded-lg border text-xs font-medium ${
              newClassTotal > 50 
                ? 'bg-rose-50 text-rose-700 border-rose-100' 
                : newClassTotal > 48 
                  ? 'bg-amber-50 text-amber-700 border-amber-100' 
                  : 'bg-slate-50 text-slate-600 border-slate-100'
            }`}>
              <div className="flex items-center space-x-1.5 mb-1">
                <AlertTriangle className={`w-4 h-4 shrink-0 ${newClassTotal > 50 ? 'text-rose-500' : newClassTotal > 48 ? 'text-amber-500' : 'text-slate-400'}`} />
                <span className="font-bold">Estimasi Rencana JP Kelas</span>
              </div>
              Kelas <span className="font-bold">{getClassName(targetClassId)}</span> akan memiliki total{' '}
              <span className={`font-bold ${newClassTotal > 50 ? 'text-rose-600 font-extrabold text-sm' : newClassTotal > 48 ? 'text-amber-600 font-extrabold text-sm' : 'text-slate-800'}`}>{newClassTotal} JP</span> dari kapasitas standar 48 JP (Batas Toleransi Maksimal 50 JP) per minggu.
              {newClassTotal <= 48 && <span className="text-slate-500 block mt-0.5">(Di bawah standar 48 JP - Aman & Valid)</span>}
              {newClassTotal > 48 && newClassTotal <= 50 && <span className="text-amber-600 block mt-0.5">(Di atas standar 48 JP, batas maksimal toleransi 50 JP - Tetap Valid)</span>}
              {newClassTotal > 50 && <span className="text-rose-600 block mt-0.5">(Melebihi batas maksimal toleransi 50 JP!)</span>}
            </div>
          )}

          <div className="flex space-x-2 pt-4 border-t border-slate-100 mt-6">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 py-2 text-sm font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 py-2 text-sm font-bold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center justify-center shadow-sm"
            >
              <Save className="w-4 h-4 mr-1.5" />
              {isEditing ? 'Simpan Perubahan' : 'Tugaskan Guru'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Elegant Confirm Dialog */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Hapus Penugasan Guru"
        message={`Apakah Anda yakin ingin menghapus beban penugasan untuk "${assignmentToDelete?.name}"?`}
        confirmText="Hapus Penugasan"
        cancelText="Batal"
        type="danger"
      />
    </div>
  );
}
