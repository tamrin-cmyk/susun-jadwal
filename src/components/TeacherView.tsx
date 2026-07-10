import React, { useState } from 'react';
import { Teacher } from '../types';
import { Plus, Edit2, Trash2, Users, Save, X } from 'lucide-react';

interface TeacherViewProps {
  teachers: Teacher[];
  onAdd: (teacher: Teacher) => void;
  onUpdate: (teacher: Teacher) => void;
  onDelete: (id: string) => void;
}

export default function TeacherView({ teachers, onAdd, onUpdate, onDelete }: TeacherViewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<Teacher, 'id'>>({
    code: '',
    name: '',
    nip: '-'
  });

  const resetForm = () => {
    setFormData({ code: '', name: '', nip: '-' });
    setIsEditing(false);
    setCurrentId(null);
  };

  const handleEdit = (teacher: Teacher) => {
    setIsEditing(true);
    setCurrentId(teacher.id);
    setFormData({
      code: teacher.code,
      name: teacher.name,
      nip: teacher.nip
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing && currentId) {
      onUpdate({ id: currentId, ...formData });
    } else {
      onAdd({ id: `t-${Date.now()}`, ...formData });
    }
    resetForm();
  };

  return (
    <div id="teacher-view-container" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Form Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 h-fit">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center">
          {isEditing ? (
            <>
              <Edit2 className="w-4 h-4 mr-2 text-indigo-600" />
              Edit Data Guru
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-2 text-indigo-600" />
              Tambah Guru Baru
            </>
          )}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Kode Guru / Inisial</label>
            <input
              type="text"
              required
              maxLength={4}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              placeholder="e.g., TR, PL, EK"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
            />
            <p className="text-[10px] text-slate-400 mt-1">Gunakan 2 atau 3 huruf kapital unik untuk draf draf jadwal ringkas.</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Nama Lengkap Guru (Gelar)</label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              placeholder="e.g., Tamrin, S.Pd"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">NIP (Isi '-' jika Honorer)</label>
            <input
              type="text"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              value={formData.nip}
              onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
            />
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
          <h2 className="text-sm font-bold text-slate-800">Daftar Guru Pengajar</h2>
          <p className="text-xs text-slate-500">Total {teachers.length} guru pengajar terdaftar di pangkalan data.</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/30">
                <th className="py-3 px-4">Kode Guru</th>
                <th className="py-3 px-4">Nama Guru</th>
                <th className="py-3 px-4">NIP</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {teachers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-400">
                    <Users className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    Belum ada data guru. Silakan tambahkan terlebih dahulu.
                  </td>
                </tr>
              ) : (
                teachers.map((teacher) => (
                  <tr key={teacher.id} className="hover:bg-slate-50/50 transition">
                    <td className="py-3 px-4 font-mono text-sm font-bold text-indigo-600">
                      <span className="bg-indigo-50 px-2 py-1 rounded border border-indigo-100">
                        {teacher.code}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{teacher.name}</td>
                    <td className="py-3 px-4 text-slate-500 font-mono text-xs">{teacher.nip}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex justify-end space-x-1.5">
                        <button
                          onClick={() => handleEdit(teacher)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Hapus guru ${teacher.name}? Semua penugasan guru ini juga akan terpengaruh.`)) {
                              onDelete(teacher.id);
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
