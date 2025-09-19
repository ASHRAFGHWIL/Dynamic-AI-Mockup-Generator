import React, { useMemo } from 'react';
import { Scenario, ScenarioOption } from '../types';
import { useTranslation } from '../hooks/useTranslation';
import Dropdown from './Dropdown';

interface ScenariosBySubcategory {
  [subcategory: string]: ScenarioOption[];
}

interface CategoryGroup {
  title: string;
  scenariosBySubcategory: ScenariosBySubcategory;
}

interface ScenarioSelectorProps {
  categories: Record<string, CategoryGroup>;
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

  const categoryOptions = useMemo(() => {
    return Object.keys(categories).map(key => ({
      value: key,
      label: categories[key].title,
    }));
  }, [categories]);

  const scenarioOptions = useMemo(() => {
    const currentCategoryData = categories[selectedCategory];
    if (!currentCategoryData) return [];

    const subcategoryKeys = Object.keys(currentCategoryData.scenariosBySubcategory);

    if (subcategoryKeys.length === 1 && subcategoryKeys[0] === 'general') {
        return currentCategoryData.scenariosBySubcategory['general'].map(scenario => ({
            value: scenario.id,
            label: scenario.title,
        }));
    }

    return subcategoryKeys.map(subcategoryKey => ({
      label: t(subcategoryKey),
      options: currentCategoryData.scenariosBySubcategory[subcategoryKey].map(scenario => ({
        value: scenario.id,
        label: scenario.title,
      })),
    }));
  }, [categories, selectedCategory, t]);


  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">{t('step1Title')}</h2>
        <div className="space-y-4">
          <Dropdown
            label={t('selectCategory')}
            options={categoryOptions}
            selectedValue={selectedCategory}
            onValueChange={onSelectCategory}
          />
          <Dropdown
            label={t('selectScenario')}
            options={scenarioOptions}
            selectedValue={selectedScenario}
            onValueChange={(val) => onSelectScenario(val as Scenario)}
          />
        </div>
      </div>
    </div>
  );
};

export default ScenarioSelector;