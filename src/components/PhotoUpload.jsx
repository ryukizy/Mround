import React, { useState } from 'react';
import { Camera, X, Upload } from 'lucide-react';

export default function PhotoUpload({ label, onPhotoChange, initialPhoto = null }) {
  const [preview, setPreview] = useState(initialPhoto);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Hanya file gambar yang diperbolehkan');
      return;
    }

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran foto maksimal 5MB');
      return;
    }

    setIsUploading(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target.result;
      setPreview(dataUrl);
      onPhotoChange(dataUrl, file); // Pass both preview and original file
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = () => {
    setPreview(null);
    onPhotoChange(null, null);
  };

  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
      
      {!preview ? (
        <label className="photo-upload cursor-pointer block">
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileSelect}
            className="hidden"
          />
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
              <Camera className="w-7 h-7 text-primary" />
            </div>
            <div>
              <p className="font-medium text-gray-700">Ambil Foto atau Upload</p>
              <p className="text-xs text-gray-500 mt-1">JPG, PNG • Maks 5MB</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-primary font-medium">
              <Upload size={14} /> Pilih File
            </div>
          </div>
        </label>
      ) : (
        <div className="photo-preview">
          <img 
            src={preview} 
            alt={label} 
            className="w-full h-[180px] object-cover"
          />
          <button
            type="button"
            onClick={removePhoto}
            className="absolute top-3 right-3 bg-white/90 backdrop-blur p-2 rounded-full shadow hover:bg-white"
          >
            <X size={18} className="text-gray-700" />
          </button>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
            <p className="text-white text-sm font-medium">{label}</p>
          </div>
        </div>
      )}

      {isUploading && (
        <div className="text-center text-sm text-gray-500 mt-2">Memproses foto...</div>
      )}
    </div>
  );
}
