import React from 'react';

interface ChargeItem {
  id: string;
  description: string;
  amount: number;
  suggestedPetName?: string;
}

interface MultiPetSplitAssignerProps {
  items: ChargeItem[];
  availablePets: any[];
  allocations: Record<string, string>; // itemId -> petId
  onAllocate: (itemId: string, petId: string) => void;
  onOpenQuickAddPet: () => void;
}

export const MultiPetSplitAssigner: React.FC<MultiPetSplitAssignerProps> = ({
  items,
  availablePets,
  allocations,
  onAllocate,
  onOpenQuickAddPet,
}) => {
  return (
    <div className="multi-pet-assigner-box">
      <div className="assigner-header-row">
        <div>
          <h4>🐾 Multi-Pet Itemized Charges Detected</h4>
          <small>Assign receipt charges and medical entries to the corresponding pet.</small>
        </div>
        <button type="button" className="btn-inline-add-pet" onClick={onOpenQuickAddPet}>
          + Add Missing Pet
        </button>
      </div>

      <div className="assigner-items-list">
        {items.map((item) => (
          <div key={item.id} className="assigner-item-card">
            <div className="item-info">
              <strong>{item.description}</strong>
              <span className="item-price">₪{item.amount.toFixed(2)}</span>
            </div>
            <div className="pet-select-group">
              <label>Assign to:</label>
              <select
                value={allocations[item.id] || availablePets[0]?._id}
                onChange={(e) => onAllocate(item.id, e.target.value)}
              >
                {availablePets.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name} ({p.species})
                  </option>
                ))}
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
