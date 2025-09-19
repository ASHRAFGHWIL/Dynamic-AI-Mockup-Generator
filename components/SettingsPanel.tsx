import React from 'react';
import { useTranslation } from '../hooks/useTranslation';

interface SettingsPanelProps {
  theme: 'light' | 'dark';
  onThemeChange: (theme: 'light' | 'dark') => void;
  fontSize: 'sm' | 'base' | 'lg';
  onFontSizeChange: (size: 'sm' | 'base' | 'lg') => void;
  onToggleFullScreen: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ theme, onThemeChange, fontSize, onFontSizeChange, onToggleFullScreen }) => {
  const { t, changeLanguage, lang } = useTranslation();

  const SettingRow: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
    <div className="flex items-center justify-between py-3">
      <span className="text-gray-700 dark:text-gray-300 font-medium">{label}</span>
      {children}
    </div>
  );

  const buttonClasses = (isActive: boolean) =>
    `px-3 py-1 text-sm rounded-md transition-colors ${
      isActive
        ? 'bg-gray-800 text-white dark:bg-gray-600'
        : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
    }`;

  return (
    <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 w-64">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{t('settings')}</h3>
      
      <SettingRow label={t('theme')}>
        <div className="flex items-center space-x-2">
          <button onClick={() => onThemeChange('light')} className={buttonClasses(theme === 'light')}>{t('light')}</button>
          <button onClick={() => onThemeChange('dark')} className={buttonClasses(theme === 'dark')}>{t('dark')}</button>
        </div>
      </SettingRow>

      <SettingRow label={t('fontSize')}>
        <div className="flex items-center space-x-2">
          <button onClick={() => onFontSizeChange('sm')} className={buttonClasses(fontSize === 'sm')}>{t('small')}</button>
          <button onClick={() => onFontSizeChange('base')} className={buttonClasses(fontSize === 'base')}>{t('medium')}</button>
          <button onClick={() => onFontSizeChange('lg')} className={buttonClasses(fontSize === 'lg')}>{t('large')}</button>
        </div>
      </SettingRow>

      <SettingRow label={t('language')}>
        <select
          value={lang}
          onChange={(e) => changeLanguage(e.target.value as 'en' | 'ar')}
          className="bg-gray-200 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-gray-500 focus:border-gray-500 block w-auto p-1.5"
        >
          <option value="en">{t('english')}</option>
          <option value="ar">{t('arabic')}</option>
        </select>
      </SettingRow>

      <div className="mt-4">
        <button 
            onClick={onToggleFullScreen}
            className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            title={t('fullscreen')}
        >
            <svg xmlns="http://www.w.org/2000/svg" className="h-5 w-5 mr-2 rtl:ml-2 rtl:mr-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 0h-4m4 0l-5-5" />
            </svg>
            {t('fullscreen')}
        </button>
      </div>

    </div>
  );
};

export default SettingsPanel;
