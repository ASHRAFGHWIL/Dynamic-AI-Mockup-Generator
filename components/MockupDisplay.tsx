import React from 'react';
import Spinner from './Spinner';
import { useTranslation } from '../hooks/useTranslation';

interface MockupDisplayProps {
  isLoading: boolean;
  loadingStep: string;
  error: string | null;
  generatedImage: string | null;
  aspectRatio: string;
}

const MockupDisplay: React.FC<MockupDisplayProps> = ({ isLoading, loadingStep, error, generatedImage, aspectRatio }) => {
  const { t } = useTranslation();
  const aspectRatioClasses: { [key: string]: string } = {
    '1:1': 'aspect-square',
    '16:9': 'aspect-video',
    '9:16': 'aspect-[9/16]',
  };
  
  return (
    <div className={`bg-gray-200 dark:bg-gray-700/50 w-full rounded-lg flex items-center justify-center p-4 relative overflow-hidden shadow-inner transition-all duration-300 ${aspectRatioClasses[aspectRatio] || 'aspect-square'}`}>
      {isLoading && (
        <div className="text-center">
          <Spinner />
          <p className="mt-4 font-semibold text-gray-700 dark:text-gray-200">{loadingStep}</p>
        </div>
      )}
      {error && !isLoading && <p className="text-red-600 font-semibold text-center p-4">{error}</p>}
      {!isLoading && !error && generatedImage && (
        <img src={generatedImage} alt="Generated Mockup" className="w-full h-full object-contain rounded-md" />
      )}
      {!isLoading && !error && !generatedImage && (
        <div className="text-center text-gray-500 dark:text-gray-400 p-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-20 w-20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l2-2a2 2 0 012.828 0l2 2m-4 5h.01M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <h3 className="mt-4 text-lg font-bold">{t('mockupPlaceholderTitle')}</h3>
          <p className="mt-1 text-sm">{t('mockupPlaceholderSubtitle')}</p>
        </div>
      )}
    </div>
  );
};

export default MockupDisplay;
