import React, { useRef } from 'react';
import { Upload, FileText, Camera } from 'lucide-react';

interface DocumentDropzoneProps {
  selectedFile: File | null;
  filePreview: string | null;
  onFileSelect: (file: File) => void;
  onDrop: (e: React.DragEvent) => void;
}

export const DocumentDropzone: React.FC<DocumentDropzoneProps> = ({
  selectedFile,
  filePreview,
  onFileSelect,
  onDrop,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div
      className="doc-dropzone"
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
      onClick={() => fileInputRef.current?.click()}
    >
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept="image/*,.pdf"
        onChange={(e) => e.target.files?.[0] && onFileSelect(e.target.files[0])}
      />

      {filePreview ? (
        <div className="doc-preview-container">
          <img src={filePreview} alt="Uploaded receipt/record" className="doc-img-preview" />
          <span className="doc-filename-badge">{selectedFile?.name}</span>
        </div>
      ) : selectedFile ? (
        <div className="doc-selected-file">
          <FileText size={40} color="#38bdf8" />
          <span className="doc-file-name">{selectedFile.name}</span>
          <span className="doc-file-size">({(selectedFile.size / 1024).toFixed(0)} KB)</span>
        </div>
      ) : (
        <div className="doc-prompt">
          <div className="doc-prompt-icons">
            <Upload size={28} />
            <Camera size={28} />
          </div>
          <p className="doc-prompt-main">Drop past clinic receipt, invoice, or vaccine card</p>
          <p className="doc-prompt-sub">Supports JPG, PNG, PDF with automated AI field parsing</p>
        </div>
      )}
    </div>
  );
};
