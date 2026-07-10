import React, { useState } from 'react';
import { ClassItem, Teacher } from '../types';
import { Plus, Edit2, Trash2, Landmark, Save, X } from 'lucide-react';

interface ClassViewProps {
  classes: ClassItem[];
  teachers: Teacher[];
  onAdd: (classItem: ClassItem) => void;
  onUpdate: (classItem: ClassItem) => void;
  onDelete: (id: string) => void;
}

export default function ClassView({ classes, teachers, onAdd, onUpdate, onDelete }: ClassViewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<ClassItem, 'id'>>({
    name: '',
    waliKelasId: ''
  });

  const resetForm = () => {
    setFormData({ name: '', waliKelasId: '' });
    setIsEditing(false);
    setCurrentId(null);
  };

  const handleEdit = (cls: ClassItem) => {
    setIsEditing(true);
    setCurrentId(cls.id);
    setFormData({
      name: cls.name,
      waliKelasId: cls.waliKelasId
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Default to the first teacher if none is selected
    const selectedWaliKelas = formData.waliKelasId || (teachers[0]?.id || '');
    if (isEditing && currentId) {
      onUpdate({ id: currentId, name: formData.name, waliKelasId: selectedWaliKelas });
    } else {
      onAdd({ id: `c-${Date.now()}`, name: formData.name, waliKelasId: selectedWaliKelas });
    }
    resetForm();
  };

  const getTeacherName = (id: string) => {
    const teacher = teachers.find(t => t.id === id);
    return teacher ? teacher.name : 'Belum Ditentukan';
  };

  return (
    <div id="class-view-container" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Form Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 h-fit">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center">
          {isEditing ? (
            <>
              <Edit2 className="w-4 h-4 mr-2 text-indigo-600" />
              Edit Kelas DKV
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-2 text-indigo-600" />
              Tambah Kelas Baru
            </>
          )}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Nama Kelas</label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              placeholder="e.g., X DKV, XI DKV"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Wali Kelas</label>
            <select
              required
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
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
              {isEditing ? 'Simpan' : 'Tambah'}
            </button>
          </div>
        </form>
      </div>

      {/* List Card */}
      <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-sm font-bold text-slate-800">Daftar Rombongan Belajar (Rombel)</h2>
          <p className="text-xs text-slate-500">Total {classes.length} kelas aktif yang diampu.</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/30">
                <th className="py-3 px-4">Nama Kelas</th>
                <th className="py-3 px-4">Wali Kelas</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {classes.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-slate-400">
                    <Landmark className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    Belum ada data kelas. Silakan tambahkan terlebih dahulu.
                  </td>
                </tr>
              ) : (
                classes.map((cls) => (
                  <tr key={cls.id} className="hover:bg-slate-50/50 transition">
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-800 flex items-center">
                        <Landmark className="w-4 h-4 mr-2 text-slate-400" />
                        {cls.name}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-medium">
                      <span className="inline-block px-2.5 py-1 bg-slate-50 rounded-lg text-xs font-semibold text-slate-700 border border-slate-100">
                        {getTeacherName(cls.waliKelasId)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex justify-end space-x-1.5">
                        <button
                          onClick={() => handleEdit(cls)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Hapus kelas ${cls.name}?`)) {
                              onDelete(cls.id);
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
  );
}
