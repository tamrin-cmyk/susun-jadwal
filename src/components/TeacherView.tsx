import React, { useState } from 'react';
import { Teacher } from '../types';
import { Plus, Edit2, Trash2, Users, Save, X } from 'lucide-react';
import { Modal, ConfirmDialog } from './ui/Dialog';

interface TeacherViewProps {
  teachers: Teacher[];
  activeDays?: string[];
  onAdd: (teacher: Teacher) => void;
  onUpdate: (teacher: Teacher) => void;
  onDelete: (id: string) => void;
}

export default function TeacherView({ teachers, activeDays, onAdd, onUpdate, onDelete }: TeacherViewProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<Teacher, 'id'>>({
    code: '',
    name: '',
    nip: '-',
    preferredDays: [],
    unavailableDays: []
  });

  const daysToUse = activeDays && activeDays.length > 0 
    ? activeDays 
    : ["Senin", "Selasa", "Rabu", "Kamis", "Sabtu", "Minggu"];

  // State for deletion
  const [teacherToDelete, setTeacherToDelete] = useState<{ id: string; name: string } | null>(null);

  const resetForm = () => {
    setFormData({ 
      code: '', 
      name: '', 
      nip: '-',
      preferredDays: [],
      unavailableDays: []
    });
    setIsEditing(false);
    setCurrentId(null);
  };

  const handleAddNew = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleEdit = (teacher: Teacher) => {
    setIsEditing(true);
    setCurrentId(teacher.id);
    setFormData({
      code: teacher.code,
      name: teacher.name,
      nip: teacher.nip,
      preferredDays: teacher.preferredDays || [],
      unavailableDays: teacher.unavailableDays || []
    });
    setIsModalOpen(true);
  };

  const handleDeleteClick = (teacher: Teacher) => {
    setTeacherToDelete({ id: teacher.id, name: teacher.name });
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (teacherToDelete) {
      onDelete(teacherToDelete.id);
      setTeacherToDelete(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing && currentId) {
      onUpdate({ id: currentId, ...formData });
    } else {
      onAdd({ id: `t-${Date.now()}`, ...formData });
    }
    setIsModalOpen(false);
    resetForm();
  };

  return (
    <div id="teacher-view-container" className="space-y-6">
      {/* List Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-50/50">
          <div>
            <h2 className="text-base font-bold text-slate-800">Daftar Guru Pengajar</h2>
            <p className="text-xs text-slate-500 mt-0.5">Kelola data guru pengajar, kode inisial, dan Nomor Induk Pegawai (NIP).</p>
          </div>
          <button
            onClick={handleAddNew}
            className="inline-flex items-center justify-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm transition"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Tambah Guru
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/30">
                <th className="py-3.5 px-6">Kode Guru</th>
                <th className="py-3.5 px-6">Nama Guru</th>
                <th className="py-3.5 px-6">NIP</th>
                <th className="py-3.5 px-6">Request Hari KBM</th>
                <th className="py-3.5 px-6 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {teachers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <Users className="w-10 h-10 mx-auto text-slate-300 mb-2.5" />
                    <p className="font-semibold text-slate-600">Belum ada data guru</p>
                    <p className="text-xs text-slate-400 mt-0.5">Silakan daftarkan guru pengajar pertama Anda.</p>
                  </td>
                </tr>
              ) : (
                teachers.map((teacher) => (
                  <tr key={teacher.id} className="hover:bg-slate-50/40 transition">
                    <td className="py-3.5 px-6 font-mono text-sm font-bold text-indigo-600">
                      <span className="bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100/50">
                        {teacher.code}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 font-semibold text-slate-800">{teacher.name}</td>
                    <td className="py-3.5 px-6 text-slate-500 font-mono text-xs">{teacher.nip}</td>
                    <td className="py-3.5 px-6">
                      <div className="flex flex-col gap-1">
                        {teacher.preferredDays && teacher.preferredDays.length > 0 && (
                          <div className="flex items-center flex-wrap gap-1 text-[11px]">
                            <span className="text-emerald-700 font-semibold mr-1">Pilihan KBM:</span>
                            {teacher.preferredDays.map(d => (
                              <span key={d} className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-100 font-medium text-[10px]">
                                {d}
                              </span>
                            ))}
                          </div>
                        )}
                        {teacher.unavailableDays && teacher.unavailableDays.length > 0 && (
                          <div className="flex items-center flex-wrap gap-1 text-[11px]">
                            <span className="text-rose-700 font-semibold mr-1">Libur/Off:</span>
                            {teacher.unavailableDays.map(d => (
                              <span key={d} className="px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-100 font-medium text-[10px]">
                                {d}
                              </span>
                            ))}
                          </div>
                        )}
                        {(!teacher.preferredDays || teacher.preferredDays.length === 0) && 
                         (!teacher.unavailableDays || teacher.unavailableDays.length === 0) && (
                          <span className="text-xs text-slate-400 italic font-medium">Fleksibel (Kapan saja)</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <div className="flex justify-end space-x-1.5">
                        <button
                          onClick={() => handleEdit(teacher)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(teacher)}
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
        title={isEditing ? 'Edit Data Guru' : 'Tambah Guru Baru'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Kode Guru / Inisial</label>
            <input
              type="text"
              required
              maxLength={4}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800"
              placeholder="e.g., TR, PL, EK"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
            />
            <p className="text-[10px] text-slate-400 mt-1">Gunakan 2 atau 3 huruf kapital unik untuk tampilan jadwal ringkas.</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Nama Lengkap Guru (Gelar)</label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800"
              placeholder="e.g., Tamrin, S.Pd"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">NIP (Isi '-' jika Honorer)</label>
            <input
              type="text"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800"
              value={formData.nip}
              onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
            />
          </div>

          <div className="border-t border-slate-100 pt-4">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Ketersediaan & Request Hari</h3>
            <p className="text-[10px] text-slate-400 mb-3">
              Atur hari yang diinginkan guru untuk KBM, atau request hari libur/off mengajar.
            </p>
            
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1 border border-slate-100 rounded-xl p-3 bg-slate-50/40">
              {daysToUse.map((day) => {
                const isPreferred = formData.preferredDays?.includes(day);
                const isUnavailable = formData.unavailableDays?.includes(day);
                const status = isPreferred ? 'preferred' : isUnavailable ? 'unavailable' : 'flexible';

                return (
                  <div key={day} className="flex items-center justify-between py-1.5 border-b border-slate-100/50 last:border-0">
                    <span className="text-xs font-bold text-slate-700">{day}</span>
                    <div className="flex bg-slate-100 rounded-lg p-0.5 text-[10px] font-bold">
                      <button
                        type="button"
                        onClick={() => {
                          const pref = (formData.preferredDays || []).filter(d => d !== day);
                          const unav = (formData.unavailableDays || []).filter(d => d !== day);
                          setFormData({ ...formData, preferredDays: pref, unavailableDays: unav });
                        }}
                        className={`px-2 py-1 rounded-md transition ${status === 'flexible' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                      >
                        Fleksibel
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const pref = [...(formData.preferredDays || []).filter(d => d !== day), day];
                          const unav = (formData.unavailableDays || []).filter(d => d !== day);
                          setFormData({ ...formData, preferredDays: pref, unavailableDays: unav });
                        }}
                        className={`px-2 py-1 rounded-md transition ${status === 'preferred' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-emerald-600'}`}
                      >
                        Pilihan KBM
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const pref = (formData.preferredDays || []).filter(d => d !== day);
                          const unav = [...(formData.unavailableDays || []).filter(d => d !== day), day];
                          setFormData({ ...formData, preferredDays: pref, unavailableDays: unav });
                        }}
                        className={`px-2 py-1 rounded-md transition ${status === 'unavailable' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-400 hover:text-rose-600'}`}
                      >
                        Libur/Off
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
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
              {isEditing ? 'Simpan Perubahan' : 'Tambah Guru'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Elegant Confirm Dialog */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Hapus Data Guru"
        message={`Apakah Anda yakin ingin menghapus data guru "${teacherToDelete?.name}"? Semua beban mengajar yang ditugaskan ke guru ini juga akan terhapus.`}
        confirmText="Hapus Guru"
        cancelText="Batal"
        type="danger"
      />
    </div>
  );
}
