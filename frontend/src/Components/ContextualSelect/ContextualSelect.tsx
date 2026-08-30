import { useState, useEffect } from 'react';
import axios from 'axios';
import { Sparkles, Check, Plus, AlertCircle } from 'lucide-react';
import './ContextualSelect.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface ContextualSelectProps {
  species: string;
  customSpecies?: string;
  selectedConditions: string[];
  selectedAllergies: string[];
  onChangeConditions: (conditions: string[]) => void;
  onChangeAllergies: (allergies: string[]) => void;
}

const PRESET_DATA: Record<string, { conditions: string[]; allergies: string[] }> = {
  dog: {
    conditions: [
      'Hip Dysplasia',
      'Canine Epilepsy',
      'Diabetes Mellitus',
      'Heart Disease (MMVD)',
      'Arthritis',
      'GDV / Bloat',
      'Cataracts',
      'Atopic Dermatitis',
    ],
    allergies: [
      'Chicken Protein',
      'Beef',
      'Dairy',
      'Wheat / Gluten',
      'Flea Saliva',
      'Pollen & Grass',
      'Dust Mites',
    ],
  },
  cat: {
    conditions: [
      'FLUTD (Urinary Tract)',
      'Chronic Kidney Disease',
      'Feline Asthma',
      'Hyperthyroidism',
      'Diabetes Mellitus',
      'Gingivitis / Stomatitis',
      'FIV / FeLV',
    ],
    allergies: [
      'Fish / Seafood',
      'Beef',
      'Dairy',
      'Flea Bites',
      'Perfumes & Incense',
      'Mold Spores',
    ],
  },
  bird: {
    conditions: [
      'Psittacosis (Parrot Fever)',
      'Feather Plucking Behavior',
      'Egg Binding',
      'Fatty Liver Disease',
      'Avian Pox',
      'Crop Stasis',
    ],
    allergies: [
      'Teflon / PTFE Fumes',
      'Cigarette Smoke',
      'Aerosol Sprays',
      'Peanuts / Aflatoxins',
    ],
  },
  reptile: {
    conditions: [
      'Metabolic Bone Disease (MBD)',
      'Respiratory Infection',
      'Infectious Stomatitis (Mouth Rot)',
      'Dysecdysis (Shedding Issue)',
      'Parasitic Infection',
    ],
    allergies: [
      'Cedar / Pine Shavings',
      'High Humidity Toxic Mold',
      'Chemical Disinfectants',
    ],
  },
  small_mammal: {
    conditions: [
      'Gastrointestinal Stasis',
      'Dental Malocclusion',
      'Ear Mites',
      'Upper Respiratory Infection',
      'Scurvy (Vitamin C Deficiency)',
    ],
    allergies: [
      'Pine / Cedar Bedding',
      'Dusty Alfalfa Hay',
      'Synthetic Fragrances',
    ],
  },
  other: {
    conditions: ['General Stress / Trauma', 'Nutritional Deficiency', 'Parasites'],
    allergies: ['Dust & Mold', 'Synthetic Bedding'],
  },
};

export const ContextualSelect = ({
  species,
  customSpecies,
  selectedConditions,
  selectedAllergies,
  onChangeConditions,
  onChangeAllergies,
}: ContextualSelectProps) => {
  const [conditions, setConditions] = useState<string[]>([]);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [customConditionInput, setCustomConditionInput] = useState('');
  const [customAllergyInput, setCustomAllergyInput] = useState('');
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  useEffect(() => {
    const preset = PRESET_DATA[species] || PRESET_DATA.other;
    setConditions(preset.conditions);
    setAllergies(preset.allergies);
  }, [species]);

  const toggleCondition = (item: string) => {
    if (selectedConditions.includes(item)) {
      onChangeConditions(selectedConditions.filter((c) => c !== item));
    } else {
      onChangeConditions([...selectedConditions, item]);
    }
  };

  const toggleAllergy = (item: string) => {
    if (selectedAllergies.includes(item)) {
      onChangeAllergies(selectedAllergies.filter((a) => a !== item));
    } else {
      onChangeAllergies([...selectedAllergies, item]);
    }
  };

  const addCustomCondition = () => {
    if (!customConditionInput.trim()) return;
    const val = customConditionInput.trim();
    if (!conditions.includes(val)) setConditions((prev) => [...prev, val]);
    if (!selectedConditions.includes(val)) onChangeConditions([...selectedConditions, val]);
    setCustomConditionInput('');
  };

  const addCustomAllergy = () => {
    if (!customAllergyInput.trim()) return;
    const val = customAllergyInput.trim();
    if (!allergies.includes(val)) setAllergies((prev) => [...prev, val]);
    if (!selectedAllergies.includes(val)) onChangeAllergies([...selectedAllergies, val]);
    setCustomAllergyInput('');
  };

  const fetchAiSuggestions = async () => {
    const animalName = customSpecies || species;
    setIsLoadingAi(true);
    setAiError(null);

    try {
      const prompt = `Give a short JSON list of 4 common conditions and 4 common allergies for a "${animalName}". Format: {"conditions": ["c1", "c2", ...], "allergies": ["a1", "a2", ...]}`;
      const res = await axios.post(`${API_URL}/chat/message`, { message: prompt });
      const text = res.data?.message || '';

      const match = text.match(/\{[\s\S]*\}/);
      if (match) {
        const parsed = JSON.parse(match[0]);
        if (parsed.conditions) {
          setConditions((prev) => Array.from(new Set([...prev, ...parsed.conditions])));
        }
        if (parsed.allergies) {
          setAllergies((prev) => Array.from(new Set([...prev, ...parsed.allergies])));
        }
      } else {
        // Fallback default addition
        setConditions((prev) => Array.from(new Set([...prev, `${animalName} Specific Sensitivity`])));
      }
    } catch (err) {
      setAiError('Could not fetch AI suggestions right now. You can type custom tags manually below.');
    } finally {
      setIsLoadingAi(false);
    }
  };

  return (
    <div className="contextual-select">
      {/* AI Generator Header */}
      <div className="contextual-select__ai-bar">
        <span>Tailored health tags for <strong>{customSpecies || species}</strong></span>
        <button
          type="button"
          className="btn btn-ghost btn-sm contextual-ai-btn"
          onClick={fetchAiSuggestions}
          disabled={isLoadingAi}
        >
          <Sparkles size={14} className={isLoadingAi ? 'animate-spin' : ''} />
          {isLoadingAi ? 'Asking AI...' : 'AI Suggestions'}
        </button>
      </div>

      {aiError && (
        <p className="contextual-select__error">
          <AlertCircle size={12} /> {aiError}
        </p>
      )}

      {/* Conditions Section */}
      <div className="contextual-section">
        <div className="contextual-section__header">
          <h4>Medical Conditions</h4>
          <div className="contextual-quick-actions">
            <button
              type="button"
              className="btn btn-ghost btn-xs"
              onClick={() => onChangeConditions([])}
            >
              Clear
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-xs"
              onClick={() => onChangeConditions([...conditions])}
            >
              Select All
            </button>
          </div>
        </div>

        <div className="contextual-chips">
          {conditions.map((item) => {
            const isSelected = selectedConditions.includes(item);
            return (
              <button
                key={item}
                type="button"
                className={`contextual-chip ${isSelected ? 'contextual-chip--selected' : ''}`}
                onClick={() => toggleCondition(item)}
              >
                {isSelected && <Check size={12} />}
                <span>{item}</span>
              </button>
            );
          })}
        </div>

        <div className="contextual-add-row">
          <input
            className="input input-sm"
            placeholder="Add custom condition..."
            value={customConditionInput}
            onChange={(e) => setCustomConditionInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomCondition())}
          />
          <button type="button" className="btn btn-ghost btn-sm" onClick={addCustomCondition}>
            <Plus size={14} /> Add
          </button>
        </div>
      </div>

      {/* Allergies Section */}
      <div className="contextual-section">
        <div className="contextual-section__header">
          <h4>Allergies & Sensitivities</h4>
          <div className="contextual-quick-actions">
            <button
              type="button"
              className="btn btn-ghost btn-xs"
              onClick={() => onChangeAllergies([])}
            >
              Clear
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-xs"
              onClick={() => onChangeAllergies([...allergies])}
            >
              Select All
            </button>
          </div>
        </div>

        <div className="contextual-chips">
          {allergies.map((item) => {
            const isSelected = selectedAllergies.includes(item);
            return (
              <button
                key={item}
                type="button"
                className={`contextual-chip ${isSelected ? 'contextual-chip--selected' : ''}`}
                onClick={() => toggleAllergy(item)}
              >
                {isSelected && <Check size={12} />}
                <span>{item}</span>
              </button>
            );
          })}
        </div>

        <div className="contextual-add-row">
          <input
            className="input input-sm"
            placeholder="Add custom allergy..."
            value={customAllergyInput}
            onChange={(e) => setCustomAllergyInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomAllergy())}
          />
          <button type="button" className="btn btn-ghost btn-sm" onClick={addCustomAllergy}>
            <Plus size={14} /> Add
          </button>
        </div>
      </div>
    </div>
  );
};
