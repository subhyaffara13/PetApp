import React, { useState, useRef } from 'react';
import axios from 'axios';
import {
  X,
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Camera,
  Calendar,
  Syringe,
  Pill,
  Building2,
  DollarSign,
  Loader2,
} from 'lucide-react';
import { MultiPetSplitAssigner } from './MultiPetSplitAssigner';
import { QuickAddPetInline } from './QuickAddPetInline';
import { API_URL } from '../../config/api';
import './DocumentUploadModal.css';

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  petId: string;
  petName: string;
  onRecordAdded: (newEvent: any) => void;
}

export const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({
  isOpen,
  onClose,
  petId,
  petName,
  onRecordAdded,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [extractedData, setExtractedData] = useState<any | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pets, setPets] = useState<any[]>([{ _id: petId, name: petName, species: 'pet' }]);
  const [allocations, setAllocations] = useState<Record<string, string>>({});
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    const fetchPets = async () => {
      try {
        const res = await axios.get(`${API_URL}/pet-profile`);
        if (Array.isArray(res.data) && res.data.length > 0) setPets(res.data);
      } catch {}
    };
    fetchPets();
  }, [petId]);

  if (!isOpen) return null;

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setError(null);
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setFilePreview(url);
    } else {
      setFilePreview(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleScanDocument = async () => {
    if (!selectedFile) return;
    setIsScanning(true);
    setError(null);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = (reader.result as string).split(',')[1];
        try {
          const res = await axios.post(`${API_URL}/pet-profile/ocr-document`, {
            fileData: base64Data,
            mimeType: selectedFile.type,
            fileName: selectedFile.name,
          });
          setExtractedData(res.data);
        } catch (err: any) {
          console.error('OCR Error:', err);
          setError('Failed to process document with OCR. Please try again or verify file format.');
        } finally {
          setIsScanning(false);
        }
      };
      reader.readAsDataURL(selectedFile);
    } catch {
      setIsScanning(false);
      setError('Could not read file data.');
    }
  };

  const handleSaveToPassport = async () => {
    if (!extractedData || !petId) return;
    setIsSaving(true);
    try {
      const clinic = extractedData.clinicName || '';
      const dx = extractedData.diagnosis || '';
      const total = extractedData.billedTotal || '';
      const detailParts = [dx, clinic, total].filter(Boolean);
      const description = extractedData.requiresManualEntry
        ? `Paper record "${extractedData.fileName || 'Document'}" was uploaded. Automatic OCR is not yet configured — the details below were entered manually.`
        : detailParts.join(' · ');

      const payload = {
        date: extractedData.date || new Date().toISOString().split('T')[0],
        type: extractedData.visitType || 'checkup',
        title: extractedData.title || `Paper Record — ${clinic || extractedData.fileName || 'Clinic Visit'}`,
        description,
        vetName: extractedData.vetName || '',
      };

      const res = await axios.post(`${API_URL}/pet-profile/${petId}/medical-event`, payload);
      onRecordAdded(res.data);
      onClose();
    } catch (err) {
      console.error('Save to passport error:', err);
      setError('Could not save record to pet passport. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="doc-modal-overlay" onClick={onClose}>
      <div className="doc-modal-container card animate-scale-up" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="doc-modal-header">
          <div className="doc-modal-title-row">
            <span className="doc-modal-icon">📸</span>
            <div>
              <h3>Scan Past Record / Receipt</h3>
              <p>Digitize paper invoices, vaccine cards & prescriptions for <strong>{petName}</strong></p>
            </div>
          </div>
          <button className="btn-close-modal" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="doc-modal-error">
            <AlertCircle size={15} /> {error}
          </div>
        )}

        {!extractedData ? (
          /* STEP 1: Upload or Snap Photo / PDF */
          <div className="doc-modal-body">
            <div
              className="doc-dropzone"
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*,application/pdf"
                style={{ display: 'none' }}
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileSelect(e.target.files[0]);
                  }
                }}
              />

              {filePreview ? (
                <div className="doc-preview-thumb">
                  <img src={filePreview} alt="Receipt preview" />
                  <span className="doc-file-name">{selectedFile?.name}</span>
                </div>
              ) : selectedFile ? (
                <div className="doc-file-selected">
                  <FileText size={40} className="doc-pdf-icon" />
                  <span className="doc-file-name">{selectedFile.name}</span>
                  <span className="doc-file-size">({Math.round(selectedFile.size / 1024)} KB)</span>
                </div>
              ) : (
                <div className="doc-dropzone-prompt">
                  <div className="doc-icons-group">
                    <Camera size={26} />
                    <Upload size={26} />
                  </div>
                  <strong>Snap a photo or drop a PDF receipt</strong>
                  <p>Supports vet invoices, vaccination certificates, prescriptions & lab reports</p>
                  <button type="button" className="btn btn-secondary btn-sm">
                    Choose File / Camera
                  </button>
                </div>
              )}
            </div>

            {selectedFile && (
              <div className="doc-scan-action-row">
                <button
                  type="button"
                  className="btn btn-primary btn-scan-doc"
                  onClick={handleScanDocument}
                  disabled={isScanning}
                >
                  {isScanning ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Analyzing with PetSOS OCR...
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} /> Scan & Extract Medical Data
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        ) : (
          /* STEP 2: Review & Approve Extracted Data */
          <div className="doc-modal-body doc-extracted-body">
            <div className="doc-success-banner">
              <CheckCircle2 size={16} /> Document successfully parsed! Review extracted details below:
            </div>

            <div className="doc-extracted-grid">
              <div className="doc-field">
                <label><Calendar size={13} /> Visit Date</label>
                <input
                  type="date"
                  value={extractedData.date}
                  onChange={(e) => setExtractedData({ ...extractedData, date: e.target.value })}
                />
              </div>

              <div className="doc-field">
                <label><Building2 size={13} /> Clinic Name</label>
                <input
                  type="text"
                  value={extractedData.clinicName}
                  onChange={(e) => setExtractedData({ ...extractedData, clinicName: e.target.value })}
                />
              </div>

              <div className="doc-field">
                <label><DollarSign size={13} /> Invoice Total</label>
                <input
                  type="text"
                  value={extractedData.billedTotal}
                  onChange={(e) => setExtractedData({ ...extractedData, billedTotal: e.target.value })}
                />
              </div>

              <div className="doc-field doc-field--full">
                <label>Diagnosis / Exam Reason</label>
                <input
                  type="text"
                  value={extractedData.diagnosis}
                  onChange={(e) => setExtractedData({ ...extractedData, diagnosis: e.target.value })}
                />
              </div>

              {/* Multi-Pet Allocation & Inline Add Pet */}
              {extractedData.itemizedCharges && extractedData.itemizedCharges.length > 0 && (
                <div className="doc-field--full">
                  <MultiPetSplitAssigner
                    items={extractedData.itemizedCharges}
                    availablePets={pets}
                    allocations={allocations}
                    onAllocate={(itemId, targetPetId) => setAllocations((prev) => ({ ...prev, [itemId]: targetPetId }))}
                    onOpenQuickAddPet={() => setShowQuickAdd(true)}
                  />
                </div>
              )}

              {showQuickAdd && (
                <div className="doc-field--full">
                  <QuickAddPetInline
                    onPetAdded={(newPet) => {
                      setPets((prev) => [...prev, newPet]);
                      setShowQuickAdd(false);
                    }}
                    onCancel={() => setShowQuickAdd(false)}
                  />
                </div>
              )}

              {/* Extracted Vaccines */}
              {extractedData.vaccinations && extractedData.vaccinations.length > 0 && (
                <div className="doc-list-group doc-field--full">
                  <label><Syringe size={13} /> Extracted Vaccinations ({extractedData.vaccinations.length})</label>
                  {extractedData.vaccinations.map((v: any, idx: number) => (
                    <div key={idx} className="doc-subitem">
                      <strong>💉 {v.vaccineName}</strong>
                      <span>Administered: {v.administeredDate} · Next Due: {v.nextDueDate}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Extracted Prescriptions */}
              {extractedData.prescriptions && extractedData.prescriptions.length > 0 && (
                <div className="doc-list-group doc-field--full">
                  <label><Pill size={13} /> Prescriptions & Preventives ({extractedData.prescriptions.length})</label>
                  {extractedData.prescriptions.map((p: any, idx: number) => (
                    <div key={idx} className="doc-subitem">
                      <strong>💊 {p.medicationName}</strong>
                      <span>{p.dosage} · {p.frequency} ({p.duration})</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="doc-modal-footer">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setExtractedData(null)}
                disabled={isSaving}
              >
                Scan Another
              </button>
              <button
                type="button"
                className="btn btn-primary btn-save-passport"
                onClick={handleSaveToPassport}
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : '✨ Append to Health Passport'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
