import { useRef } from 'react';
import ProductCard from './ProductCard';
import './ProductCarousel.css';

interface Product {
    id: number;
    name: string;
    sellingPrice: number;
    promotionalPrice?: number;
    stockQuantity: number;
    images?: any[];
    salesCount?: number;
    rating?: number;
    reviewCount?: number;
    isBestSeller?: boolean;
    isLocal?: boolean;
}

interface ProductCarouselProps {
    title: string;
    subtitle?: string;
    products: Product[];
}

function ProductCarousel({ title, subtitle, products }: ProductCarouselProps) {
    const carouselRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (carouselRef.current) {
            const scrollAmount = 400;
            const newScrollPosition = direction === 'left'
                ? carouselRef.current.scrollLeft - scrollAmount
                : carouselRef.current.scrollLeft + scrollAmount;

            carouselRef.current.scrollTo({
                left: newScrollPosition,
                behavior: 'smooth'
            });
        }
    };

    if (!products || products.length === 0) {
        return null;
    }

    return (
        <section className="product-carousel-section">
            <div className="carousel-header">
                <div>
                    <h3>{title}</h3>
                    {subtitle && <p className="carousel-subtitle">{subtitle}</p>}
                </div>
            </div>

            <div className="carousel-container">
                <button
                    className="carousel-nav-btn prev"
                    onClick={() => scroll('left')}
                    aria-label="Anterior"
                >
                    ‹
                </button>

                <div className="carousel-track" ref={carouselRef}>
                    {products.map(product => (
                        <div key={product.id} className="carousel-item">
                            <ProductCard product={product} />
                        </div>
                    ))}
                </div>

                <button
                    className="carousel-nav-btn next"
                    onClick={() => scroll('right')}
                    aria-label="Próximo"
                >
                    ›
                </button>
            </div>
        </section>
    );
}

export default ProductCarousel;
