import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, CheckCircle2, AlertCircle, Sparkles, Loader2 } from 'lucide-react';
import { MultiPetSplitAssigner } from './MultiPetSplitAssigner';
import { QuickAddPetInline } from './QuickAddPetInline';
import { DocumentDropzone } from './Components/DocumentDropzone';
import { ExtractedDataForm } from './Components/ExtractedDataForm';
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

  useEffect(() => {
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
      setFilePreview(URL.createObjectURL(file));
    } else {
      setFilePreview(null);
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
        } catch {
          setError('Failed to process document with OCR. Please try again.');
        } finally {
          setIsScanning(false);
        }
      };
      reader.readAsDataURL(selectedFile);
    } catch {
      setIsScanning(false);
      setError('File read error.');
    }
  };

  const handleSaveToPet = async () => {
    if (!extractedData) return;
    setIsSaving(true);
    try {
      const newEvent = {
        date: extractedData.date || new Date().toISOString().split('T')[0],
        type: 'receipt',
        title: extractedData.clinicName || 'Clinic Visit',
        description: `Diagnoses: ${extractedData.diagnoses || 'None'}. Meds: ${extractedData.medications || 'None'}`,
        cost: extractedData.cost || 0,
        clinic: extractedData.clinicName,
        verifiedByClinic: false,
        receiptUrl: filePreview || undefined,
      };

      const res = await axios.post(`${API_URL}/pet-profile/${petId}/medical-history`, newEvent);
      onRecordAdded(res.data);
      onClose();
    } catch {
      setError('Failed to save record to pet profile.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="doc-modal-backdrop" onClick={onClose}>
      <div className="doc-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="doc-modal-header">
          <div>
            <h3>AI Medical Document & Receipt Scanner</h3>
            <p className="doc-modal-sub">Upload past records for automated digitization into {petName}'s health passport</p>
          </div>
          <button className="doc-modal-close-btn" onClick={onClose}><X size={18} /></button>
        </div>

        {error && <div className="doc-error-banner"><AlertCircle size={15} /><span>{error}</span></div>}

        <DocumentDropzone
          selectedFile={selectedFile}
          filePreview={filePreview}
          onFileSelect={handleFileSelect}
          onDrop={(e) => { e.preventDefault(); if (e.dataTransfer.files?.[0]) handleFileSelect(e.dataTransfer.files[0]); }}
        />

        {!extractedData && (
          <div className="doc-modal-actions">
            <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" onClick={handleScanDocument} disabled={!selectedFile || isScanning}>
              {isScanning ? <><Loader2 size={16} className="animate-spin" /> Analyzing Document...</> : <><Sparkles size={16} /> Scan & Extract Data</>}
            </button>
          </div>
        )}

        {extractedData && (
          <div className="doc-extracted-section">
            <div className="doc-extracted-header">
              <CheckCircle2 size={18} color="#10b981" />
              <h4>Extracted Clinical Data (Review & Edit)</h4>
            </div>

            <ExtractedDataForm extractedData={extractedData} setExtractedData={setExtractedData} />

            {extractedData.multiPetDetected && extractedData.lineItems?.length > 0 && (
              <MultiPetSplitAssigner
                items={extractedData.lineItems}
                availablePets={pets}
                allocations={allocations}
                onAllocate={(itemId: string, pId: string) => setAllocations((prev) => ({ ...prev, [itemId]: pId }))}
                onOpenQuickAddPet={() => setShowQuickAdd(true)}
              />
            )}

            {showQuickAdd && (
              <QuickAddPetInline
                onPetAdded={(newPet: any) => { setPets((prev) => [...prev, newPet]); setShowQuickAdd(false); }}
                onCancel={() => setShowQuickAdd(false)}
              />
            )}

            <div className="doc-modal-actions">
              <button className="btn btn-secondary" onClick={() => setExtractedData(null)}>Rescan</button>
              <button className="btn btn-primary" onClick={handleSaveToPet} disabled={isSaving}>
                {isSaving ? 'Saving...' : `Save to ${petName}'s Passport`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
