import React, { useMemo } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import Dropdown from './Dropdown';

export interface StyleOption {
  id: string;
  label: string;
  description: string;
}

interface ArtisticStyleSelectorProps {
  styles: StyleOption[];
  selectedStyle: string;
  onSelectStyle: (styleId: string) => void;
}

const ArtisticStyleSelector: React.FC<ArtisticStyleSelectorProps> = ({ styles, selectedStyle, onSelectStyle }) => {
  const { t } = useTranslation();

  const styleOptions = useMemo(() => {
    return styles.map(style => ({
      value: style.id,
      label: t(style.label),
    }));
  }, [styles, t]);
  
  const selectedStyleDescription = useMemo(() => {
    const style = styles.find(s => s.id === selectedStyle);
    return style ? t(style.description) : '';
  }, [selectedStyle, styles, t]);

  return (
    <div className="space-y-2">
      <Dropdown
        label="Select an artistic style"
        options={styleOptions}
        selectedValue={selectedStyle}
        onValueChange={onSelectStyle}
      />
      {selectedStyleDescription && (
        <p className="text-sm text-gray-600 dark:text-gray-400 px-1">
          {selectedStyleDescription}
        </p>
      )}
    </div>
  );
};

export default ArtisticStyleSelector;