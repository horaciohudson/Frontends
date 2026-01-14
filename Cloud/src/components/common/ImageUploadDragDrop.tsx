import { useState, useRef } from 'react';
import './ImageUploadDragDrop.css';

interface ImageUploadDragDropProps {
  onImagesSelected: (files: File[]) => void;
  maxFiles?: number;
  maxSizeMB?: number;
  acceptedFormats?: string[];
}

function ImageUploadDragDrop({
  onImagesSelected,
  maxFiles = 5,
  maxSizeMB = 5,
  acceptedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
}: ImageUploadDragDropProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFiles = (files: File[]): File[] => {
    const validFiles: File[] = [];
    const maxSizeBytes = maxSizeMB * 1024 * 1024;

    for (const file of files) {
      // Validar tipo
      if (!acceptedFormats.includes(file.type)) {
        setError(`❌ ${file.name}: Formato não suportado. Use JPG, PNG ou WEBP.`);
        continue;
      }

      // Validar tamanho
      if (file.size > maxSizeBytes) {
        setError(`❌ ${file.name}: Arquivo muito grande (máx ${maxSizeMB}MB).`);
        continue;
      }

      validFiles.push(file);
    }

    // Validar quantidade
    if (validFiles.length > maxFiles) {
      setError(`❌ Máximo de ${maxFiles} imagens permitidas.`);
      return validFiles.slice(0, maxFiles);
    }

    return validFiles;
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    setError(null);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setError(null);

    const files = Array.from(e.dataTransfer.files);
    const validFiles = validateFiles(files);

    if (validFiles.length > 0) {
      onImagesSelected(validFiles);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = validateFiles(files);

    if (validFiles.length > 0) {
      onImagesSelected(validFiles);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="image-upload-drag-drop">
      <div
        className={`drag-drop-zone ${isDragging ? 'dragging' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <div className="drag-drop-content">
          <div className="drag-drop-icon">📸</div>
          <h3>Arraste imagens aqui</h3>
          <p>ou clique para selecionar</p>
          <small>Formatos: JPG, PNG, WEBP (máx {maxSizeMB}MB cada)</small>
          <small>Máximo: {maxFiles} imagens</small>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={acceptedFormats.join(',')}
        onChange={handleFileInputChange}
        style={{ display: 'none' }}
      />

      {error && (
        <div className="upload-error">
          {error}
          <button
            type="button"
            className="error-close"
            onClick={() => setError(null)}
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}

export default ImageUploadDragDrop;
