import React from 'react';
import { useTranslation } from '../hooks/useTranslation';

interface VariationCountSelectorProps {
  value: number;
  onChange: (value: number) => void;
}

const VariationCountSelector: React.FC<VariationCountSelectorProps> = ({ value, onChange }) => {
  const { t } = useTranslation();

  const options = [3, 6, 9];

  return (
    <div>
      <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4">{t('variationCountTitle')}</h3>
      <div className="flex flex-wrap gap-3">
        {options.map((option) => (
          <button
            key={option}
            onClick={() => onChange(option)}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 border-2 ${
              value === option
                ? 'bg-gray-800 text-white border-gray-800 shadow-md dark:bg-gray-600 dark:border-gray-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100 hover:border-gray-400 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700'
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
};

export default VariationCountSelector;