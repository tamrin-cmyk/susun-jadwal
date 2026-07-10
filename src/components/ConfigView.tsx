import React, { useState } from 'react';
import { SchoolConfig } from '../types';
import { Save, Check, Landmark, User, MapPin, Database, UploadCloud, DownloadCloud, Clock } from 'lucide-react';

interface ConfigViewProps {
  config: SchoolConfig;
  onSave: (newConfig: SchoolConfig) => void;
  // Firebase sync props
  firebaseSyncEnabled: boolean;
  setFirebaseSyncEnabled: (val: boolean) => void;
  onSaveToCloud: () => Promise<boolean>;
  onLoadFromCloud: () => Promise<boolean>;
  lastCloudSync: string | null;
  isSyncing: boolean;
}

export default function ConfigView({ 
  config, 
  onSave,
  firebaseSyncEnabled,
  setFirebaseSyncEnabled,
  onSaveToCloud,
  onLoadFromCloud,
  lastCloudSync,
  isSyncing
}: ConfigViewProps) {
  const [formData, setFormData] = useState<SchoolConfig>({ ...config });
  const [showSuccess, setShowSuccess] = useState(false);
  const [syncMessage, setSyncMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Configuration Card */}
      <div id="config-view-container" className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      {/* Header */}
      <div className="border-b border-slate-100 bg-slate-50/50 p-6">
        <h2 className="text-lg font-bold text-slate-800">Konfigurasi Lembaga</h2>
        <p className="text-sm text-slate-500">Pengaturan dasar identitas instansi yang akan terpantul pada seluruh formulir cetak & kop surat draf jadwal.</p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Row 1: General Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Jenjang (MA, MTs, SD, SMK)</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Landmark className="w-4 h-4" />
              </span>
              <input
                type="text"
                required
                value={formData.jenjang}
                onChange={(e) => setFormData({ ...formData, jenjang: e.target.value })}
                className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                placeholder="SMKs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Nama Instansi</label>
            <input
              type="text"
              required
              value={formData.namaInstansi}
              onChange={(e) => setFormData({ ...formData, namaInstansi: e.target.value })}
              className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              placeholder="Cordova"
            />
          </div>
        </div>

        {/* Row 2: Academic Term */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Tahun Ajaran</label>
            <input
              type="text"
              required
              value={formData.tahunAjaran}
              onChange={(e) => setFormData({ ...formData, tahunAjaran: e.target.value })}
              className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              placeholder="2026/2027"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Semester</label>
            <select
              value={formData.semester}
              onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
              className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              <option value="Ganjil">Ganjil</option>
              <option value="Genap">Genap</option>
            </select>
          </div>
        </div>

        {/* Document signing authority section */}
        <div className="border-t border-slate-100 pt-5 space-y-4">
          <h3 className="text-xs font-extrabold text-indigo-700 uppercase tracking-widest flex items-center">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 mr-2"></span>
            Otoritas Penandatangan Dokumen
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Nama Kepala Sekolah</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  required
                  value={formData.namaKepalaSekolah}
                  onChange={(e) => setFormData({ ...formData, namaKepalaSekolah: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  placeholder="Poniman Abdul Latif, S.Sy"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">NIP Kepala Sekolah</label>
              <input
                type="text"
                value={formData.nipKepalaSekolah}
                onChange={(e) => setFormData({ ...formData, nipKepalaSekolah: e.target.value })}
                className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                placeholder="-"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Nama Waka Kurikulum</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  required
                  value={formData.namaWakaKurikulum}
                  onChange={(e) => setFormData({ ...formData, namaWakaKurikulum: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  placeholder="Eri Kurniawan, S.Pd.I"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">NIP Waka Kurikulum</label>
              <input
                type="text"
                value={formData.nipWakaKurikulum}
                onChange={(e) => setFormData({ ...formData, nipWakaKurikulum: e.target.value })}
                className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                placeholder="-"
              />
            </div>
          </div>
        </div>

        {/* Location Info */}
        <div className="border-t border-slate-100 pt-5 grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="md:col-span-1">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Kota / Lokasi Sekolah</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <MapPin className="w-4 h-4" />
              </span>
              <input
                type="text"
                required
                value={formData.kota}
                onChange={(e) => setFormData({ ...formData, kota: e.target.value })}
                className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                placeholder="Tebo"
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Alamat Madrasah / Sekolah</label>
            <input
              type="text"
              required
              value={formData.alamat}
              onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
              className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              placeholder="JL. Lawu Desa Suka Maju"
            />
          </div>
        </div>

        {/* Logo and App Customization */}
        <div className="border-t border-slate-100 pt-5">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Logo Sekolah / Aplikasi (URL Gambar)</label>
          <div className="flex items-center space-x-4">
            <img
              src={formData.logoUrl || "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=200"}
              alt="Logo"
              className="w-16 h-16 object-cover rounded-lg border border-slate-200 bg-slate-50"
              onError={(e) => {
                // Failback logo if URL fails
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=200';
              }}
            />
            <div className="flex-1">
              <input
                type="url"
                value={formData.logoUrl}
                onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                placeholder="https://images.unsplash.com/photo..."
              />
              <p className="text-[11px] text-slate-400 mt-1">Gunakan format gambar transparan (PNG atau JPG) yang dapat diakses secara publik.</p>
            </div>
          </div>
        </div>

        {/* Save Bar */}
        <div className="border-t border-slate-100 pt-5 flex items-center justify-between">
          <div>
            {showSuccess && (
              <div className="flex items-center text-emerald-600 text-sm font-semibold animate-fade-in">
                <Check className="w-5 h-5 mr-1.5" /> Konfigurasi berhasil disimpan!
              </div>
            )}
          </div>
          <button
            type="submit"
            className="inline-flex items-center px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg shadow-sm hover:bg-blue-700 transition"
          >
            <Save className="w-4 h-4 mr-2" />
            Simpan Konfigurasi
          </button>
        </div>
      </form>
    </div>

    {/* Firebase Cloud Sync Card */}
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="border-b border-slate-100 bg-slate-50/50 p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center">
            <Database className="w-5 h-5 text-blue-600 mr-2.5" />
            Penyimpanan Cloud Firebase (Firestore)
          </h2>
          <p className="text-sm text-slate-500">Amankan data jadwal Anda di database cloud. Sinkronisasi otomatis menjaga data Anda aman dari kehilangan.</p>
        </div>
        <div className="flex items-center space-x-2 shrink-0">
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${isSyncing ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${isSyncing ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`}></span>
            {isSyncing ? 'Sinkronisasi...' : 'Terhubung'}
          </span>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {/* Sync Toggles and Last Sync Status */}
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div>
                <h4 className="text-sm font-bold text-slate-800">Sinkronisasi Otomatis</h4>
                <p className="text-xs text-slate-500 mt-0.5">Simpan otomatis setiap kali Anda melakukan perubahan jadwal.</p>
              </div>
              <button
                type="button"
                onClick={() => setFirebaseSyncEnabled(!firebaseSyncEnabled)}
                className="focus:outline-none transition-colors"
              >
                {firebaseSyncEnabled ? (
                  <div className="w-11 h-6 bg-blue-600 rounded-full p-0.5 flex justify-end cursor-pointer transition-all duration-200">
                    <div className="w-5 h-5 bg-white rounded-full shadow-sm"></div>
                  </div>
                ) : (
                  <div className="w-11 h-6 bg-slate-300 rounded-full p-0.5 flex justify-start cursor-pointer transition-all duration-200">
                    <div className="w-5 h-5 bg-white rounded-full shadow-sm"></div>
                  </div>
                )}
              </button>
            </div>

            <div className="flex items-center space-x-3 text-xs text-slate-500 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <Clock className="w-4 h-4 text-slate-400 shrink-0" />
              <div>
                <span className="font-semibold block text-slate-700">Terakhir Tersinkronisasi ke Cloud:</span>
                <span className="font-mono text-[11px] block mt-0.5">
                  {lastCloudSync ? new Date(lastCloudSync).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'medium' }) : 'Belum pernah tersinkronisasi'}
                </span>
              </div>
            </div>
          </div>

          {/* Cloud Storage Action Buttons */}
          <div className="bg-slate-50/50 p-5 rounded-xl border border-slate-200/50 space-y-3 flex flex-col justify-center">
            <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-widest">Aksi Manual</h4>
            <p className="text-xs text-slate-400">Gunakan opsi ini jika Anda ingin mengunggah draf saat ini atau memulihkan jadwal dari cloud secara manual.</p>
            
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                disabled={isSyncing}
                onClick={async () => {
                  const ok = await onSaveToCloud();
                  if (ok) {
                    setSyncMessage({ text: 'Data berhasil dicadangkan ke Firebase Cloud!', type: 'success' });
                    setTimeout(() => setSyncMessage(null), 4000);
                  } else {
                    setSyncMessage({ text: 'Gagal mengunggah data ke Cloud.', type: 'error' });
                    setTimeout(() => setSyncMessage(null), 4000);
                  }
                }}
                className="inline-flex items-center justify-center px-4 py-2.5 bg-blue-50 hover:bg-blue-100 disabled:opacity-50 text-blue-700 text-xs font-bold rounded-lg border border-blue-100 transition"
              >
                <UploadCloud className="w-4 h-4 mr-2" />
                Upload Data
              </button>

              <button
                type="button"
                disabled={isSyncing}
                onClick={async () => {
                  if (window.confirm('Apakah Anda yakin ingin mengunduh data dari Cloud? Data lokal di browser Anda saat ini akan ditimpa.')) {
                    const ok = await onLoadFromCloud();
                    if (ok) {
                      setSyncMessage({ text: 'Jadwal berhasil diunduh dari Firebase Cloud!', type: 'success' });
                      setTimeout(() => setSyncMessage(null), 4000);
                    } else {
                      setSyncMessage({ text: 'Gagal mengunduh data atau data cloud tidak ditemukan.', type: 'error' });
                      setTimeout(() => setSyncMessage(null), 4000);
                    }
                  }
                }}
                className="inline-flex items-center justify-center px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 disabled:opacity-50 text-indigo-700 text-xs font-bold rounded-lg border border-indigo-100 transition"
              >
                <DownloadCloud className="w-4 h-4 mr-2" />
                Download Cloud
              </button>
            </div>

            {syncMessage && (
              <div className={`text-xs font-semibold p-2.5 rounded-lg border text-center mt-3 animate-fade-in ${syncMessage.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'}`}>
                {syncMessage.text}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
  );
}
