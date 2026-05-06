import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { ArrowLeft, Download, Share2 } from 'lucide-react';
import { toast } from 'sonner';

export default function DetailReportPage() {
  const { id: reportId } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReport();
  }, [reportId]);

  const fetchReport = async () => {
    try {
      const docRef = doc(db, 'morningRounds', reportId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setReport({ id: docSnap.id, ...docSnap.data() });
      } else {
        toast.error('Laporan tidak ditemukan');
        navigate('/history');
      }
    } catch (error) {
      console.error(error);
      toast.error('Gagal memuat detail laporan');
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = async () => {
    if (!report) return;

    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Header
    doc.setFillColor(22, 163, 74);
    doc.rect(0, 0, pageWidth, 28, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.text('LAPORAN MORNING ROUND 5R', pageWidth / 2, 12, { align: 'center' });
    doc.setFontSize(11);
    doc.text('PT. MAYORA INDAH Tbk', pageWidth / 2, 20, { align: 'center' });

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);

    let y = 38;

    // Info Umum
    doc.setFont(undefined, 'bold');
    doc.text('Informasi Umum', 15, y);
    doc.setFont(undefined, 'normal');
    y += 8;

    doc.text(`Tanggal: ${report.tanggal}`, 15, y);
    doc.text(`Area: ${report.area}`, 110, y);
    y += 7;
    doc.text(`Petugas: ${report.user?.displayName || report.user?.email}`, 15, y);
    doc.text(`Status: ${report.status}`, 110, y);
    y += 12;

    // Checklist
    doc.setFont(undefined, 'bold');
    doc.text('Checklist 5R', 15, y);
    doc.setFont(undefined, 'normal');
    y += 8;

    const checklist = report.checklist || {};
    Object.keys(checklist).forEach((key, index) => {
      const label = key.charAt(0).toUpperCase() + key.slice(1);
      doc.text(`${label}: ${checklist[key]}`, 20, y);
      y += 6;
    });
    y += 6;

    // Catatan
    if (report.catatan) {
      doc.setFont(undefined, 'bold');
      doc.text('Catatan Temuan:', 15, y);
      doc.setFont(undefined, 'normal');
      y += 6;
      const lines = doc.splitTextToSize(report.catatan, 170);
      doc.text(lines, 15, y);
      y += lines.length * 6 + 8;
    }

    // Photos
    if (report.foto_sebelum || report.foto_sesudah) {
      doc.setFont(undefined, 'bold');
      doc.text('Foto Dokumentasi', 15, y);
      y += 8;

      try {
        if (report.foto_sebelum) {
          const img = await loadImage(report.foto_sebelum);
          doc.addImage(img, 'JPEG', 15, y, 80, 55);
        }
        if (report.foto_sesudah) {
          const img = await loadImage(report.foto_sesudah);
          doc.addImage(img, 'JPEG', 105, y, 80, 55);
        }
        y += 62;
      } catch (e) {
        console.warn('Could not load images for PDF');
      }
    }

    // Signature
    if (report.signature) {
      doc.setFont(undefined, 'bold');
      doc.text('Tanda Tangan Petugas', 15, y);
      y += 8;
      try {
        const sigImg = await loadImage(report.signature);
        doc.addImage(sigImg, 'PNG', 15, y, 70, 26);
      } catch (e) {}
    }

    // Footer
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text(`Dicetak pada ${format(new Date(), 'dd MMM yyyy HH:mm', { locale: id })}`, 15, 285);
    doc.text('Morning Round 5R Checklist • Mayora', pageWidth / 2, 285, { align: 'center' });

    doc.save(`Laporan_Morning_Round_${report.area}_${report.tanggal}.pdf`);
    toast.success('PDF berhasil diunduh');
  };

  const loadImage = (src) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!report) return null;

  return (
    <div className="pb-20 px-4 pt-3 max-w-lg mx-auto" id="report-content">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600">
          <ArrowLeft size={20} /> Kembali
        </button>
        <div className="flex gap-2">
          <button 
            onClick={generatePDF}
            className="flex items-center gap-2 px-4 py-2 bg-white border rounded-xl text-sm font-medium shadow-sm"
          >
            <Download size={16} /> PDF
          </button>
        </div>
      </div>

      <div className="card p-6">
        {/* Title */}
        <div className="text-center mb-6">
          <div className="text-primary font-bold text-xl">LAPORAN MORNING ROUND 5R</div>
          <div className="text-xs text-gray-500">PT MAYORA INDAH Tbk</div>
        </div>

        {/* Info */}
        <div className="grid grid-cols-2 gap-y-4 text-sm mb-6">
          <div><span className="text-gray-500">Tanggal</span><br /><strong>{report.tanggal}</strong></div>
          <div><span className="text-gray-500">Area</span><br /><strong>{report.area}</strong></div>
          <div><span className="text-gray-500">Petugas</span><br /><strong>{report.user?.displayName}</strong></div>
          <div><span className="text-gray-500">Status</span><br />{report.status}</div>
        </div>

        {/* Checklist */}
        <div className="mb-6">
          <h4 className="font-semibold mb-3">Checklist 5R</h4>
          <div className="space-y-2 text-sm">
            {Object.entries(report.checklist || {}).map(([key, value]) => (
              <div key={key} className="flex justify-between py-1 border-b">
                <span className="capitalize">{key}</span>
                <span className={`font-medium ${value === 'Ya' ? 'text-success' : value === 'Tidak' ? 'text-danger' : 'text-gray-500'}`}>
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Photos */}
        {(report.foto_sebelum || report.foto_sesudah) && (
          <div className="mb-6">
            <h4 className="font-semibold mb-3">Foto Dokumentasi</h4>
            <div className="grid grid-cols-2 gap-3">
              {report.foto_sebelum && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Sebelum</p>
                  <img src={report.foto_sebelum} alt="Sebelum" className="rounded-xl border w-full" />
                </div>
              )}
              {report.foto_sesudah && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Sesudah</p>
                  <img src={report.foto_sesudah} alt="Sesudah" className="rounded-xl border w-full" />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Catatan */}
        {report.catatan && (
          <div className="mb-6">
            <h4 className="font-semibold mb-2">Catatan Temuan</h4>
            <p className="text-sm bg-gray-50 p-4 rounded-2xl border">{report.catatan}</p>
          </div>
        )}

        {/* Signature */}
        {report.signature && (
          <div>
            <h4 className="font-semibold mb-2">Tanda Tangan Petugas</h4>
            <img src={report.signature} alt="Tanda Tangan" className="border rounded-2xl max-h-[90px]" />
          </div>
        )}
      </div>

      <div className="text-center text-[10px] text-gray-400 mt-6">
        Dicetak • {format(new Date(), 'dd MMM yyyy HH:mm', { locale: id })}
      </div>
    </div>
  );
}
