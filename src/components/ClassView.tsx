import React, { useState } from 'react';
import { ClassItem, Teacher } from '../types';
import { Plus, Edit2, Trash2, Landmark, Save, X } from 'lucide-react';
import { Modal, ConfirmDialog } from './ui/Dialog';

interface ClassViewProps {
  classes: ClassItem[];
  teachers: Teacher[];
  onAdd: (classItem: ClassItem) => void;
  onUpdate: (classItem: ClassItem) => void;
  onDelete: (id: string) => void;
}

export default function ClassView({ classes, teachers, onAdd, onUpdate, onDelete }: ClassViewProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<ClassItem, 'id'>>({
    name: '',
    waliKelasId: ''
  });

  // State for deletion
  const [classToDelete, setClassToDelete] = useState<{ id: string; name: string } | null>(null);

  const resetForm = () => {
    setFormData({ name: '', waliKelasId: '' });
    setIsEditing(false);
    setCurrentId(null);
  };

  const handleAddNew = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleEdit = (cls: ClassItem) => {
    setIsEditing(true);
    setCurrentId(cls.id);
    setFormData({
      name: cls.name,
      waliKelasId: cls.waliKelasId
    });
    setIsModalOpen(true);
  };

  const handleDeleteClick = (cls: ClassItem) => {
    setClassToDelete({ id: cls.id, name: cls.name });
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (classToDelete) {
      onDelete(classToDelete.id);
      setClassToDelete(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedWaliKelas = formData.waliKelasId || (teachers[0]?.id || '');
    if (isEditing && currentId) {
      onUpdate({ id: currentId, name: formData.name, waliKelasId: selectedWaliKelas });
    } else {
      onAdd({ id: `c-${Date.now()}`, name: formData.name, waliKelasId: selectedWaliKelas });
    }
    setIsModalOpen(false);
    resetForm();
  };

  const getTeacherName = (id: string) => {
    const teacher = teachers.find(t => t.id === id);
    return teacher ? teacher.name : 'Belum Ditentukan';
  };

  return (
    <div id="class-view-container" className="space-y-6">
      {/* List Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-50/50">
          <div>
            <h2 className="text-base font-bold text-slate-800">Daftar Rombongan Belajar (Rombel)</h2>
            <p className="text-xs text-slate-500 mt-0.5">Kelola nama kelas serta penetapan guru wali kelas pendamping.</p>
          </div>
          <button
            onClick={handleAddNew}
            className="inline-flex items-center justify-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm transition"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Tambah Rombel
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/30">
                <th className="py-3.5 px-6">Nama Kelas</th>
                <th className="py-3.5 px-6">Wali Kelas</th>
                <th className="py-3.5 px-6 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {classes.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-12 text-center text-slate-400">
                    <Landmark className="w-10 h-10 mx-auto text-slate-300 mb-2.5" />
                    <p className="font-semibold text-slate-600">Belum ada data kelas</p>
                    <p className="text-xs text-slate-400 mt-0.5">Silakan tambahkan rombongan belajar pertama Anda.</p>
                  </td>
                </tr>
              ) : (
                classes.map((cls) => (
                  <tr key={cls.id} className="hover:bg-slate-50/40 transition">
                    <td className="py-3.5 px-6">
                      <span className="font-bold text-slate-800 flex items-center">
                        <Landmark className="w-4 h-4 mr-2 text-slate-400" />
                        {cls.name}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-slate-600 font-medium">
                      <span className="inline-block px-2.5 py-1 bg-slate-50 rounded-lg text-xs font-semibold text-slate-700 border border-slate-100">
                        {getTeacherName(cls.waliKelasId)}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <div className="flex justify-end space-x-1.5">
                        <button
                          onClick={() => handleEdit(cls)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(cls)}
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
        title={isEditing ? 'Edit Kelas DKV' : 'Tambah Rombel Baru'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Nama Kelas</label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800"
              placeholder="e.g., X DKV, XI DKV"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Wali Kelas</label>
            <select
              required
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800"
              value={formData.waliKelasId}
              onChange={(e) => setFormData({ ...formData, waliKelasId: e.target.value })}
            >
              <option value="">-- Pilih Wali Kelas --</option>
              {teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.name} ({teacher.code})
                </option>
              ))}
            </select>
          </div>

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
              {isEditing ? 'Simpan Perubahan' : 'Tambah Kelas'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Elegant Confirm Dialog */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Hapus Rombel Kelas"
        message={`Apakah Anda yakin ingin menghapus kelas "${classToDelete?.name}"? Semua beban mengajar yang dipetakan ke rombel ini akan terhapus.`}
        confirmText="Hapus Kelas"
        cancelText="Batal"
        type="danger"
      />
    </div>
  );
}
