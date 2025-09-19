import React, { useRef } from 'react';
import { DesignType } from '../types';
import { useTranslation } from '../hooks/useTranslation';

interface ImageUploaderProps {
  onImageUpload: (base64: string, mimeType: string, dataUrl: string) => void;
  onClearImage: () => void;
  onError: (message: string) => void;
  designType: DesignType;
  previewUrl: string | null;
}

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15 MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload, onClearImage, onError, designType, previewUrl }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t } = useTranslation();

  const processFile = (file: File | null | undefined) => {
    if (!file) {
      return;
    }

    // 1. Validation
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      onError(t('errorInvalidFileType'));
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      onError(t('errorFileSizeTooLarge'));
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    onError(''); // Clear any existing error

    // 2. Read file
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      const mimeType = file.type;
      const pureBase64 = dataUrl.split(',')[1];
      onImageUpload(pureBase64, mimeType, dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    processFile(event.target.files?.[0]);
  };

  const handleDrop = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
    processFile(event.dataTransfer.files?.[0]);
  };

  const handleDragOver = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };
  
  const handleClear = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    onClearImage();
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  }

  return (
    <div className="w-full">
      <input
        type="file"
        id="file-upload"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
        accept="image/jpeg,image/png,image/gif,image/webp"
        aria-hidden="true"
        tabIndex={-1}
      />
      <label
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        htmlFor="file-upload"
        className="cursor-pointer group block w-full"
        aria-label={t('uploadInstruction')}
      >
        <div className="relative border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-gray-500 dark:hover:border-gray-400 transition-colors duration-200">
          {previewUrl ? (
            <div className="relative">
              <img src={previewUrl} alt="Upload preview" className="mx-auto max-h-48 rounded-md object-contain" />
              <button
                onClick={handleClear}
                className="absolute -top-2 -right-2 rtl:-left-2 rtl:-right-auto bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full p-1.5 shadow-md hover:bg-gray-100 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                aria-label={t('clearImage')}
              >
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                 </svg>
              </button>
            </div>
          ) : (
            <>
              <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" stroke="currentColor" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l2-2a2 2 0 012.828 0l2 2m-4 5h.01M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <p className="mt-2 font-semibold text-gray-600 dark:text-gray-300">
                {t('uploadInstruction')} <span className="font-normal text-gray-500 dark:text-gray-400">{t('uploadOrDrag')}</span>
              </p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {t('uploadFileType', { designType: designType.replace('_', ' ') })}
              </p>
            </>
          )}
        </div>
      </label>
    </div>
  );
};

export default ImageUploader;