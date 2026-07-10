import React, { useState } from 'react';
import { TimeSlot } from '../types';
import { Plus, Edit2, Trash2, Clock, Save, RotateCcw } from 'lucide-react';
import { defaultTimeSlots } from '../data/defaultData';
import { Modal, ConfirmDialog } from './ui/Dialog';

interface TimeTemplateViewProps {
  timeSlots: TimeSlot[];
  onAdd: (slot: TimeSlot) => void;
  onUpdate: (slot: TimeSlot) => void;
  onDelete: (id: string) => void;
  onReset: (defaults: TimeSlot[]) => void;
}

export default function TimeTemplateView({
  timeSlots,
  onAdd,
  onUpdate,
  onDelete,
  onReset
}: TimeTemplateViewProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);

  const [formData, setFormData] = useState<Omit<TimeSlot, 'id'>>({
    period: 1,
    startTime: '07:15',
    endTime: '08:00',
    isBreak: false,
    label: ''
  });

  // State for deletion
  const [slotToDelete, setSlotToDelete] = useState<{ id: string; label: string } | null>(null);

  const resetForm = () => {
    setFormData({
      period: 1,
      startTime: '07:15',
      endTime: '08:00',
      isBreak: false,
      label: ''
    });
    setIsEditing(false);
    setCurrentId(null);
  };

  const handleAddNew = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleEdit = (slot: TimeSlot) => {
    setIsEditing(true);
    setCurrentId(slot.id);
    setFormData({
      period: slot.period,
      startTime: slot.startTime,
      endTime: slot.endTime,
      isBreak: slot.isBreak,
      label: slot.label || ''
    });
    setIsModalOpen(true);
  };

  const handleDeleteClick = (slot: TimeSlot) => {
    const label = slot.isBreak ? `Istirahat (${slot.label})` : `Jam ke-${slot.period}`;
    setSlotToDelete({ id: slot.id, label });
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (slotToDelete) {
      onDelete(slotToDelete.id);
      setSlotToDelete(null);
    }
  };

  const handleResetClick = () => {
    setIsResetConfirmOpen(true);
  };

  const handleConfirmReset = () => {
    onReset(defaultTimeSlots);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing && currentId) {
      onUpdate({
        id: currentId,
        period: formData.isBreak ? 0 : formData.period,
        startTime: formData.startTime,
        endTime: formData.endTime,
        isBreak: formData.isBreak,
        label: formData.isBreak ? formData.label : undefined
      });
    } else {
      onAdd({
        id: `ts-${Date.now()}`,
        period: formData.isBreak ? 0 : formData.period,
        startTime: formData.startTime,
        endTime: formData.endTime,
        isBreak: formData.isBreak,
        label: formData.isBreak ? formData.label : undefined
      });
    }
    setIsModalOpen(false);
    resetForm();
  };

  return (
    <div id="time-template-view" className="space-y-6">
      {/* List Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-800">Struktur Jam Sekolah</h2>
            <p className="text-xs text-slate-500 mt-0.5">Definisi durasi jam pelajaran (JP) dan interval waktu istirahat KBM.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleResetClick}
              className="inline-flex items-center justify-center px-4 py-2 border border-slate-200 hover:border-slate-300 text-xs font-semibold text-slate-600 bg-white hover:text-slate-800 rounded-lg shadow-sm transition"
            >
              <RotateCcw className="w-4 h-4 mr-1.5 text-slate-400" />
              Reset Default
            </button>
            <button
              onClick={handleAddNew}
              className="inline-flex items-center justify-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm transition"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Tambah Slot
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/30">
                <th className="py-3.5 px-6">Tipe Slot</th>
                <th className="py-3.5 px-6">Keterangan</th>
                <th className="py-3.5 px-6">Rentang Waktu</th>
                <th className="py-3.5 px-6 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {timeSlots.map((slot) => (
                <tr key={slot.id} className={`hover:bg-slate-50/40 transition ${slot.isBreak ? 'bg-amber-50/10' : ''}`}>
                  <td className="py-3.5 px-6">
                    {slot.isBreak ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-100">
                        Istirahat
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold bg-indigo-50 text-indigo-800 border border-indigo-100">
                        Jam ke-{slot.period}
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-6 font-medium text-slate-700">
                    {slot.isBreak ? slot.label : `Kegiatan Belajar Mengajar (KBM)`}
                  </td>
                  <td className="py-3.5 px-6 font-semibold text-slate-800">
                    <span className="inline-flex items-center text-xs text-slate-600">
                      <Clock className="w-4 h-4 mr-1.5 text-slate-400 shrink-0" />
                      {slot.startTime} - {slot.endTime}
                    </span>
                  </td>
                  <td className="py-3.5 px-6 text-right">
                    <div className="flex justify-end space-x-1.5">
                      <button
                        onClick={() => handleEdit(slot)}
                        className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(slot)}
                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Hapus"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Elegant Modal Form */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditing ? 'Edit Slot Waktu' : 'Tambah Slot Waktu Baru'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center space-x-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
            <input
              type="checkbox"
              id="isBreak"
              className="rounded text-indigo-600 focus:ring-indigo-500 focus:ring-2 focus:ring-indigo-500/20 w-4 h-4 transition-all"
              checked={formData.isBreak}
              onChange={(e) => setFormData({ ...formData, isBreak: e.target.checked })}
            />
            <label htmlFor="isBreak" className="text-xs font-bold text-slate-700 cursor-pointer select-none">
              Ini adalah Jam Istirahat / Rehat Sekolah
            </label>
          </div>

          {!formData.isBreak && (
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Jam Pelajaran Ke-</label>
              <input
                type="number"
                min={1}
                max={15}
                required
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800"
                value={formData.period}
                onChange={(e) => setFormData({ ...formData, period: parseInt(e.target.value) || 1 })}
              />
            </div>
          )}

          {formData.isBreak && (
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Label Istirahat</label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800"
                placeholder="e.g., Istirahat I, Sholat & Makan"
                value={formData.label}
                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Waktu Mulai</label>
              <input
                type="time"
                required
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Waktu Selesai</label>
              <input
                type="time"
                required
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              />
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
              {isEditing ? 'Simpan Slot' : 'Tambah Slot'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Elegant Confirm Dialog for Delete */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Hapus Slot Waktu"
        message={`Apakah Anda yakin ingin menghapus slot waktu "${slotToDelete?.label}"?`}
        confirmText="Hapus Slot"
        cancelText="Batal"
        type="danger"
      />

      {/* Elegant Confirm Dialog for Reset */}
      <ConfirmDialog
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirm={handleConfirmReset}
        title="Reset Template Waktu"
        message="Apakah Anda yakin ingin mengembalikan struktur waktu ke format bawaan (8 jam pelajaran, 2 istirahat)? Semua penyesuaian kustom Anda akan hilang."
        confirmText="Ya, Reset"
        cancelText="Batal"
        type="warning"
      />
    </div>
  );
}
