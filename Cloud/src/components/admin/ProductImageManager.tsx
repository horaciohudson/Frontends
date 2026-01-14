import { useState } from 'react';
import './ProductImageManager.css';

interface ProductImage {
    id?: number;
    imageUrl: string;
    imageName?: string;
    isPrimary: boolean;
    sortOrder: number;
    altText?: string;
}

interface ProductImageManagerProps {
    images: ProductImage[];
    onChange: (images: ProductImage[]) => void;
}

function ProductImageManager({ images, onChange }: ProductImageManagerProps) {
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [editUrl, setEditUrl] = useState('');

    const handleEditImage = (index: number) => {
        setEditingIndex(index);
        setEditUrl(images[index].imageUrl);
    };

    const handleLoadImage = () => {
        if (!editUrl.trim()) {
            alert('URL da imagem é obrigatória');
            return;
        }

        const updatedImages = [...images];
        updatedImages[editingIndex!] = {
            ...updatedImages[editingIndex!],
            imageUrl: editUrl,
            imageName: editUrl.split('/').pop() || 'image',
        };
        onChange(updatedImages);
        setEditingIndex(null);
        setEditUrl('');
    };

    const handleCancel = () => {
        setEditingIndex(null);
        setEditUrl('');
    };

    return (
        <div className="product-image-manager">
            <div className="image-manager-header">
                <h3>📷 Imagens do Produto</h3>
            </div>

            <div className="images-grid">
                {images.length === 0 ? (
                    <div className="empty-images">
                        <p>📷 Nenhuma imagem adicionada</p>
                    </div>
                ) : (
                    images.map((image, index) => (
                        <div key={index} className="image-card">
                            {editingIndex === index ? (
                                <div className="image-edit-form">
                                    <input
                                        type="url"
                                        value={editUrl}
                                        onChange={(e) => setEditUrl(e.target.value)}
                                        placeholder="https://exemplo.com/imagem.jpg"
                                    />
                                    <div className="edit-actions">
                                        <button
                                            type="button"
                                            className="btn-primary btn-sm"
                                            onClick={handleLoadImage}
                                        >
                                            Load
                                        </button>
                                        <button
                                            type="button"
                                            className="btn-secondary btn-sm"
                                            onClick={handleCancel}
                                        >
                                            Cancelar
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="image-preview">
                                        <img src={image.imageUrl} alt={image.altText || 'Produto'} />
                                        {image.isPrimary && (
                                            <span className="primary-badge">⭐ Principal</span>
                                        )}
                                    </div>
                                    <div className="image-actions">
                                        <button
                                            type="button"
                                            className="btn-icon"
                                            onClick={() => handleEditImage(index)}
                                            title="Editar"
                                        >
                                            ✏️
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default ProductImageManager;
