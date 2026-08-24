import React, { useRef, useState } from 'react';
import { UploadCloud, FileType, AlertCircle } from 'lucide-react';
import { formatFileSize } from '../../utils/fileUtils';

interface FileUploaderProps {
  accept: string;
  multiple?: boolean;
  maxSizeBytes?: number;
  label?: string;
  description?: string;
  allowedFormatsText?: string;
  onFilesSelected: (files: File[]) => void;
  className?: string;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  accept,
  multiple = false,
  maxSizeBytes = 100 * 1024 * 1024, // 100MB default
  label = 'Drop your files here',
  description = 'or click to browse from your device',
  allowedFormatsText,
  onFilesSelected,
  className = '',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const validateAndPassFiles = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setErrorMessage(null);

    const validFiles: File[] = [];
    const acceptedExtensions = accept
      .split(',')
      .map((ext) => ext.trim().toLowerCase().replace('*', ''));

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];

      // Check size
      if (file.size > maxSizeBytes) {
        setErrorMessage(
          `File "${file.name}" exceeds the maximum size limit of ${formatFileSize(maxSizeBytes)}.`
        );
        return;
      }

      // Check format
      const fileExt = '.' + file.name.split('.').pop()?.toLowerCase();
      const isAccepted =
        accept === '*' ||
        acceptedExtensions.some((ext) => {
          if (ext.startsWith('.')) return fileExt === ext;
          if (ext.includes('/')) return file.type.startsWith(ext.replace('/*', ''));
          return false;
        });

      if (!isAccepted && accept !== '*') {
        setErrorMessage(`"${file.name}" has an unsupported format. Please upload ${allowedFormatsText || accept}.`);
        return;
      }

      validFiles.push(file);
      if (!multiple) break;
    }

    if (validFiles.length > 0) {
      onFilesSelected(validFiles);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    validateAndPassFiles(e.dataTransfer.files);
  };

  return (
    <div className={`w-full ${className}`}>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`group relative cursor-pointer rounded-3xl border-2 border-dashed p-8 md:p-12 text-center transition-all duration-200 flex flex-col items-center justify-center ${
          isDragging
            ? 'border-[#B79B70] bg-[#1B1A17] scale-[1.01]'
            : 'border-[#2A2824] bg-[#161513] hover:border-[#B79B70]/60 hover:bg-[#191815]'
        } shadow-sm backdrop-blur-sm`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={(e) => {
            validateAndPassFiles(e.target.files);
            e.target.value = ''; // Reset for re-selection
          }}
          className="hidden"
          aria-label="Upload files"
        />

        <div className="w-14 h-14 rounded-2xl bg-[#1B1A17] border border-[#2A2824] group-hover:border-[#B79B70]/40 text-[#B79B70] flex items-center justify-center mb-4 transition-transform group-hover:scale-105 shadow-inner">
          <UploadCloud className="w-7 h-7" />
        </div>

        <h3 className="text-base sm:text-lg font-bold text-[#F5F1E8] mb-1">
          {label}
        </h3>
        <p className="text-xs sm:text-sm text-[#B8B2A7] mb-5 max-w-md">
          {description}
        </p>

        <button
          type="button"
          className="px-6 py-2.5 rounded-xl bg-[#E8DFCF] hover:bg-[#F5F1E8] text-[#11110F] text-xs sm:text-sm font-bold shadow-md transition-all active:scale-95 cursor-pointer"
        >
          Select {multiple ? 'Files' : 'File'}
        </button>

        {allowedFormatsText && (
          <div className="mt-4 flex items-center gap-1.5 text-xs text-[#7A756D]">
            <FileType className="w-3.5 h-3.5 text-[#B79B70]" />
            <span>Supported formats: {allowedFormatsText}</span>
          </div>
        )}
      </div>

      {errorMessage && (
        <div className="mt-3 p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-sm flex items-start gap-2.5 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};
