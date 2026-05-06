import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../services/firebase';
import { format } from 'date-fns';
import { ArrowLeft, Save, Send } from 'lucide-react';
import { toast } from 'sonner';
import PhotoUpload from '../components/PhotoUpload';
import SignaturePad from '../components/SignaturePad';

const AREAS = [
  'Packing Line 1',
  'Warehouse B',
  'Utility Area',
  'Raw Material Store',
  'Produksi Area 2',
  'Quality Control',
  'Loading Dock',
];

const CHECKLIST_ITEMS = [
  { key: 'ringkas', label: 'Ringkas (Rapi & Teratur)' },
  { key: 'rapi', label: 'Rapi (Tertata Baik)' },
  { key: 'resik', label: 'Resik (Bersih)' },
  { key: 'rawat', label: 'Rawat (Terawat)' },
  { key: 'rajin', label: 'Rajin (Disiplin & Konsisten)' },
];

export default function ChecklistFormPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    tanggal: format(new Date(), 'yyyy-MM-dd'),
    area: AREAS[0],
    catatan: '',
  });

  const [checklist, setChecklist] = useState({
    ringkas: 'Ya',
    rapi: 'Ya',
    resik: 'Ya',
    rawat: 'Ya',
    rajin: 'Ya',
  });

  const [fotoSebelum, setFotoSebelum] = useState(null);
  const [fotoSebelumFile, setFotoSebelumFile] = useState(null);
  const [fotoSesudah, setFotoSesudah] = useState(null);
  const [fotoSesudahFile, setFotoSesudahFile] = useState(null);
  const [signature, setSignature] = useState(null);

  const [loading, setLoading] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);

  const handleChecklistChange = (key, value) => {
    setChecklist(prev => ({ ...prev, [key]: value }));
  };

  const handlePhotoChange = (type, dataUrl, file) => {
    if (type === 'sebelum') {
      setFotoSebelum(dataUrl);
      setFotoSebelumFile(file);
    } else {
      setFotoSesudah(dataUrl);
      setFotoSesudahFile(file);
    }
  };

  const calculateStatus = () => {
    const allYa = Object.values(checklist).every(v => v === 'Ya');
    const hasPhotos = fotoSebelum && fotoSesudah;
    const hasSignature = !!signature;

    if (allYa && hasPhotos && hasSignature) return 'Selesai';
    if (Object.values(checklist).some(v => v !== 'Ya') || hasPhotos || hasSignature) return 'Progress';
    return 'Belum';
  };

  const uploadPhoto = async (dataUrl, path) => {
    if (!dataUrl) return null;
    const storageRef = ref(storage, path);
    await uploadString(storageRef, dataUrl, 'data_url');
    return await getDownloadURL(storageRef);
  };

  const handleSubmit = async (isDraft = false) => {
    if (!currentUser) return;

    const status = isDraft ? 'Progress' : calculateStatus();

    // Basic validation for submit
    if (!isDraft) {
      if (!signature) {
        toast.error('Tanda tangan wajib diisi');
        return;
      }
      if (!fotoSebelum || !fotoSesudah) {
        toast.error('Foto Sebelum dan Sesudah wajib diisi');
        return;
      }
    }

    setLoading(true);
    setSavingDraft(isDraft);

    try {
      // Upload photos if exist
      let fotoSebelumUrl = null;
      let fotoSesudahUrl = null;

      if (fotoSebelum) {
        const path = `morning-rounds/${currentUser.uid}/${Date.now()}_sebelum.jpg`;
        fotoSebelumUrl = await uploadPhoto(fotoSebelum, path);
      }
      if (fotoSesudah) {
        const path = `morning-rounds/${currentUser.uid}/${Date.now()}_sesudah.jpg`;
        fotoSesudahUrl = await uploadPhoto(fotoSesudah, path);
      }

      // Prepare data
      const dataToSave = {
        tanggal: formData.tanggal,
        area: formData.area,
        user: {
          uid: currentUser.uid,
          email: currentUser.email,
          displayName: currentUser.email?.split('@')[0] || 'Petugas'
        },
        status: status,
        checklist: checklist,
        foto_sebelum: fotoSebelumUrl,
        foto_sesudah: fotoSesudahUrl,
        catatan: formData.catatan.trim(),
        signature: signature, // base64 for now (can be uploaded to storage later)
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      };

      await addDoc(collection(db, 'morningRounds'), dataToSave);

      toast.success(isDraft ? 'Draft berhasil disimpan' : 'Checklist berhasil disubmit!');
      navigate('/history');
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('Gagal menyimpan data. Coba lagi.');
    } finally {
      setLoading(false);
      setSavingDraft(false);
    }
  };

  return (
    <div className="pb-24 px-4 pt-3 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-500">
          <ArrowLeft size={22} />
        </button>
        <div>
          <h1 className="text-xl font-bold">Form Morning Round</h1>
          <p className="text-xs text-gray-500">Isi checklist 5R dengan lengkap</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Informasi Umum */}
        <div className="card p-5">
          <h3 className="font-semibold mb-4 text-gray-800">Informasi Umum</h3>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Tanggal</label>
              <input 
                type="date" 
                value={formData.tanggal} 
                onChange={e => setFormData({...formData, tanggal: e.target.value})}
                className="input mt-1.5" 
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">Area</label>
              <select 
                value={formData.area} 
                onChange={e => setFormData({...formData, area: e.target.value})}
                className="input mt-1.5 select"
              >
                {AREAS.map(area => (
                  <option key={area} value={area}>{area}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">Petugas</label>
              <div className="input mt-1.5 bg-gray-50 text-gray-600">
                {currentUser?.email}
              </div>
            </div>
          </div>
        </div>

        {/* Checklist 5R */}
        <div className="card p-5">
          <h3 className="font-semibold mb-4 text-gray-800">Checklist 5R</h3>
          
          <div className="space-y-3">
            {CHECKLIST_ITEMS.map((item) => (
              <div key={item.key} className="check-item">
                <span className="font-medium text-sm">{item.label}</span>
                
                <div className="radio-group">
                  {['Ya', 'Tidak', 'N/A'].map(option => {
                    const isActive = checklist[item.key] === option;
                    let className = 'radio-option';
                    
                    if (isActive) {
                      if (option === 'Ya') className += ' active-ya';
                      else if (option === 'Tidak') className += ' active-tidak';
                      else className += ' active-na';
                    }
                    
                    return (
                      <label 
                        key={option}
                        className={className}
                        onClick={() => handleChecklistChange(item.key, option)}
                      >
                        <input 
                          type="radio" 
                          name={item.key} 
                          checked={isActive} 
                          onChange={() => {}} 
                          className="hidden" 
                        />
                        {option}
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Foto Dokumentasi */}
        <div className="card p-5 space-y-5">
          <h3 className="font-semibold text-gray-800">Foto Dokumentasi</h3>
          
          <PhotoUpload 
            label="Foto Sebelum" 
            onPhotoChange={(url, file) => handlePhotoChange('sebelum', url, file)}
            initialPhoto={fotoSebelum}
          />
          
          <PhotoUpload 
            label="Foto Sesudah" 
            onPhotoChange={(url, file) => handlePhotoChange('sesudah', url, file)}
            initialPhoto={fotoSesudah}
          />
        </div>

        {/* Catatan */}
        <div className="card p-5">
          <label className="font-semibold text-gray-800 block mb-2">Catatan Temuan (Opsional)</label>
          <textarea
            value={formData.catatan}
            onChange={(e) => setFormData({...formData, catatan: e.target.value})}
            className="input min-h-[100px] resize-y"
            placeholder="Contoh: Area sudah bersih, hanya ada sedikit sampah di sudut..."
          />
        </div>

        {/* Tanda Tangan */}
        <div className="card p-5">
          <h3 className="font-semibold text-gray-800 mb-3">Tanda Tangan Petugas</h3>
          <SignaturePad onSave={setSignature} />
          <p className="text-[10px] text-gray-400 mt-2 text-center">Tanda tangan ini akan tersimpan sebagai bukti</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="fixed bottom-[72px] left-0 right-0 px-4 max-w-lg mx-auto z-40">
        <div className="flex gap-3">
          <button
            onClick={() => handleSubmit(true)}
            disabled={loading}
            className="flex-1 btn-secondary py-3.5 flex items-center justify-center gap-2 text-sm"
          >
            <Save size={18} /> {savingDraft ? 'Menyimpan...' : 'SIMPAN DRAFT'}
          </button>
          
          <button
            onClick={() => handleSubmit(false)}
            disabled={loading}
            className="flex-1 btn-primary py-3.5 flex items-center justify-center gap-2 text-sm"
          >
            <Send size={18} /> {loading && !savingDraft ? 'Mengirim...' : 'SUBMIT LANJUT'}
          </button>
        </div>
      </div>
    </div>
  );
}
