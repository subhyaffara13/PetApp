import React from 'react';
import { Calendar, Building2, DollarSign, Syringe, Pill } from 'lucide-react';

interface ExtractedDataFormProps {
  extractedData: any;
  setExtractedData: React.Dispatch<React.SetStateAction<any>>;
}

export const ExtractedDataForm: React.FC<ExtractedDataFormProps> = ({
  extractedData,
  setExtractedData,
}) => {
  return (
    <div className="doc-extracted-form">
      <div className="form-group">
        <label><Calendar size={14} /> Visit / Invoice Date</label>
        <input
          type="date"
          className="form-input"
          value={extractedData.date || ''}
          onChange={(e) => setExtractedData({ ...extractedData, date: e.target.value })}
        />
      </div>

      <div className="form-group">
        <label><Building2 size={14} /> Clinic / Hospital Name</label>
        <input
          type="text"
          className="form-input"
          value={extractedData.clinicName || ''}
          onChange={(e) => setExtractedData({ ...extractedData, clinicName: e.target.value })}
        />
      </div>

      <div className="form-group">
        <label><DollarSign size={14} /> Total Cost / Paid (₪)</label>
        <input
          type="number"
          className="form-input"
          value={extractedData.cost || ''}
          onChange={(e) => setExtractedData({ ...extractedData, cost: Number(e.target.value) })}
        />
      </div>

      <div className="form-group">
        <label><Syringe size={14} /> Diagnoses / Procedures</label>
        <input
          type="text"
          className="form-input"
          value={extractedData.diagnoses || ''}
          onChange={(e) => setExtractedData({ ...extractedData, diagnoses: e.target.value })}
        />
      </div>

      <div className="form-group full-width">
        <label><Pill size={14} /> Medications & Vaccines Prescribed</label>
        <textarea
          rows={2}
          className="form-input"
          value={extractedData.medications || ''}
          onChange={(e) => setExtractedData({ ...extractedData, medications: e.target.value })}
        />
      </div>
    </div>
  );
};
