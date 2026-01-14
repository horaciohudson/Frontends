import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { categoriesAPI } from '../services/api';
import './CategoryMegaMenu.css';

interface Category {
    id: number;
    name: string;
    description?: string;
}

interface CategoryMegaMenuProps {
    isOpen: boolean;
    onClose: () => void;
}

function CategoryMegaMenu({ isOpen, onClose }: CategoryMegaMenuProps) {
    const navigate = useNavigate();
    const [categories, setCategories] = useState<Category[]>([]);

    useEffect(() => {
        if (isOpen) {
            loadCategories();
        }
    }, [isOpen]);

    const loadCategories = async () => {
        try {
            const response = await categoriesAPI.getAll();
            setCategories(response.data.data || []);
        } catch (err) {
            console.error('Erro ao carregar categorias:', err);
        }
    };

    const getCategoryIcon = (categoryName: string): string => {
        const iconMap: Record<string, string> = {
            // Categorias principais
            'roupas femininas': '👗',
            'roupas masculinas': '👔',
            'calçados': '👟',
            'acessórios': '👜',
            'roupas infantis': '🧸',
            
            // Subcategorias femininas
            'vestidos': '👗',
            'blusas': '👚',
            'calças': '👖',
            'saias': '🩱',
            
            // Subcategorias masculinas
            'camisetas': '👕',
            'camisas': '👔',
            'calças jeans': '👖',
            
            // Subcategorias calçados
            'tênis': '👟',
            'sapatos': '👞',
            'sandálias': '👡',
            
            // Outros
            'jaquetas': '🧥',
            'moda praia': '🩱',
            'shorts': '🩳',
            'roupas íntimas': '🩲',
            'esportivo': '⚽',
            'bolsas': '👜',
            'chapéus': '🎩',
            'óculos': '🕶️',
            'relógios': '⌚',
            'joias': '💍',
            'cintos': '🎀',
            'meias': '🧦',
            'luvas': '🧤',
            'cachecóis': '🧣',
            'bonés': '🧢',
            'botas': '🥾',
        };

        const key = categoryName.toLowerCase();
        return iconMap[key] || '🛍️';
    };

    const handleCategoryClick = (categoryId: number) => {
        navigate(`/products?category=${categoryId}`);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="mega-menu-overlay" onClick={onClose} />
            <div className="mega-menu">
                <div className="mega-menu-header">
                    <h3>Todas as Categorias</h3>
                    <button className="close-btn" onClick={onClose}>✕</button>
                </div>
                <div className="mega-menu-grid">
                    {categories.map(category => (
                        <div
                            key={category.id}
                            className="mega-menu-item"
                            onClick={() => handleCategoryClick(category.id)}
                        >
                            <div className="category-icon-large">
                                {getCategoryIcon(category.name)}
                            </div>
                            <div className="category-info">
                                <h4>{category.name}</h4>
                                {category.description && (
                                    <p className="category-desc">{category.description}</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}

export default CategoryMegaMenu;
