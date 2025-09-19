import React from 'react';
import { Scenario, ScenarioOption } from '../types';
import { useTranslation } from '../hooks/useTranslation';

interface ScenarioSelectorProps {
  categories: Record<string, { title: string; scenarios: ScenarioOption[] }>;
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  selectedScenario: Scenario;
  onSelectScenario: (scenario: Scenario) => void;
}

const ScenarioSelector: React.FC<ScenarioSelectorProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  selectedScenario,
  onSelectScenario,
}) => {
  const { t } = useTranslation();
  const categoryKeys = Object.keys(categories);
  const currentScenarios = categories[selectedCategory]?.scenarios || [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">{t('step1Title')}</h2>
        <div className="flex flex-wrap gap-2">
          {categoryKeys.map((key) => (
            <button
              key={key}
              onClick={() => onSelectCategory(key)}
              className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors duration-200 ${
                selectedCategory === key
                  ? 'bg-gray-800 text-white shadow-md dark:bg-gray-600'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700'
              }`}
            >
              {categories[key].title}
            </button>
          ))}
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4">{t('selectScenario')}</h3>
        <div className="space-y-3" role="radiogroup" aria-labelledby="scenario-heading">
          {currentScenarios.map((scenario) => (
            <div
              key={scenario.id}
              onClick={() => onSelectScenario(scenario.id)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelectScenario(scenario.id); } }}
              className={`cursor-pointer rounded-lg border-2 p-4 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 ${
                selectedScenario === scenario.id 
                ? 'border-gray-800 bg-gray-100 shadow-sm dark:border-gray-500 dark:bg-gray-700' 
                : 'border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-400 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700/50 dark:hover:border-gray-500'
              }`}
              aria-checked={selectedScenario === scenario.id}
              role="radio"
              tabIndex={0}
            >
                <h4 className="font-semibold text-gray-800 dark:text-gray-200">{scenario.title}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{scenario.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ScenarioSelector;
