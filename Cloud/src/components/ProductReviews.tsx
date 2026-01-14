import { useState, useEffect } from 'react';
import { reviewsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import './ProductReviews.css';

interface Review {
    id: number;
    customerName: string;
    rating: number;
    feedback: string;
    images?: { imageUrl: string }[];
    createdAt: string;
    isEdited: boolean;
}

interface ProductReviewsProps {
    productId: number;
    onReviewAdded?: () => void;
}

function ProductReviews({ productId, onReviewAdded }: ProductReviewsProps) {
    const { isAuthenticated } = useAuth();
    const { showNotification } = useNotification();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [canReview, setCanReview] = useState(false);
    
    // Form state
    const [rating, setRating] = useState(5);
    const [feedback, setFeedback] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Pagination
    const [currentPage, setCurrentPage] = useState(0);
    const [hasMore, setHasMore] = useState(false);

    useEffect(() => {
        loadReviews();
        if (isAuthenticated) {
            checkCanReview();
        }
    }, [productId, currentPage]);

    const loadReviews = async () => {
        try {
            setLoading(true);
            const response = await reviewsAPI.getByProduct(productId, currentPage, 10);
            const data = response.data.data;
            
            setReviews(data.content || []);
            setHasMore(!data.last);
        } catch (err) {
            console.error('Error loading reviews:', err);
        } finally {
            setLoading(false);
        }
    };

    const checkCanReview = async () => {
        try {
            const response = await reviewsAPI.canReview(productId);
            setCanReview(response.data.data || false);
        } catch (err) {
            console.error('Error checking review permission:', err);
            setCanReview(false);
        }
    };

    const handleSubmitReview = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (feedback.length < 10) {
            showNotification('error', 'O comentário deve ter pelo menos 10 caracteres');
            return;
        }

        try {
            setSubmitting(true);
            await reviewsAPI.create({
                productId,
                rating,
                comment: feedback
            });
            
            showNotification('success', 'Avaliação enviada com sucesso!');
            setShowForm(false);
            setFeedback('');
            setRating(5);
            setCanReview(false);
            loadReviews();
            onReviewAdded?.();
        } catch (err: any) {
            const message = err.response?.data?.message || 'Erro ao enviar avaliação';
            showNotification('error', message);
        } finally {
            setSubmitting(false);
        }
    };

    const renderStars = (rating: number, interactive = false, onRate?: (rating: number) => void) => {
        return (
            <div className={`stars ${interactive ? 'interactive' : ''}`}>
                {[1, 2, 3, 4, 5].map(star => (
                    <span
                        key={star}
                        className={`star ${star <= rating ? 'filled' : ''}`}
                        onClick={() => interactive && onRate?.(star)}
                    >
                        ★
                    </span>
                ))}
            </div>
        );
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
    };

    const calculateAverageRating = () => {
        if (reviews.length === 0) return '0';
        const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
        return (sum / reviews.length).toFixed(1);
    };

    return (
        <div className="product-reviews">
            <div className="reviews-header">
                <div className="reviews-summary">
                    <h2>⭐ Avaliações dos Clientes</h2>
                    {reviews.length > 0 && (
                        <div className="rating-summary">
                            <div className="average-rating">
                                <span className="rating-number">{calculateAverageRating()}</span>
                                {renderStars(Math.round(parseFloat(calculateAverageRating())))}
                            </div>
                            <span className="review-count">
                                {reviews.length} {reviews.length === 1 ? 'avaliação' : 'avaliações'}
                            </span>
                        </div>
                    )}
                </div>

                {isAuthenticated && canReview && !showForm && (
                    <button 
                        className="btn btn-primary"
                        onClick={() => setShowForm(true)}
                    >
                        ✍️ Escrever Avaliação
                    </button>
                )}
            </div>

            {/* Formulário de Nova Avaliação */}
            {showForm && (
                <div className="review-form-container">
                    <form className="review-form" onSubmit={handleSubmitReview}>
                        <h3>Escreva sua avaliação</h3>
                        
                        <div className="form-group">
                            <label>Sua nota:</label>
                            {renderStars(rating, true, setRating)}
                        </div>

                        <div className="form-group">
                            <label htmlFor="feedback">Seu comentário:</label>
                            <textarea
                                id="feedback"
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                                placeholder="Conte-nos sobre sua experiência com este produto..."
                                rows={5}
                                minLength={10}
                                maxLength={1000}
                                required
                            />
                            <small className="char-count">
                                {feedback.length}/1000 caracteres (mínimo 10)
                            </small>
                        </div>

                        <div className="form-actions">
                            <button
                                type="button"
                                className="btn btn-outline"
                                onClick={() => {
                                    setShowForm(false);
                                    setFeedback('');
                                    setRating(5);
                                }}
                                disabled={submitting}
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={submitting || feedback.length < 10}
                            >
                                {submitting ? 'Enviando...' : 'Publicar Avaliação'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Lista de Avaliações */}
            {loading ? (
                <div className="reviews-loading">Carregando avaliações...</div>
            ) : reviews.length === 0 ? (
                <div className="reviews-empty">
                    <p>Seja o primeiro a avaliar este produto!</p>
                </div>
            ) : (
                <div className="reviews-list">
                    {reviews.map(review => (
                        <div key={review.id} className="review-item">
                            <div className="review-header">
                                <div className="reviewer-info">
                                    <div className="reviewer-avatar">
                                        {review.customerName.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="reviewer-details">
                                        <span className="reviewer-name">{review.customerName}</span>
                                        <span className="review-date">
                                            {formatDate(review.createdAt)}
                                            {review.isEdited && ' (editado)'}
                                        </span>
                                    </div>
                                </div>
                                {renderStars(review.rating)}
                            </div>

                            <div className="review-content">
                                <p>{review.feedback}</p>
                            </div>

                            {review.images && review.images.length > 0 && (
                                <div className="review-images">
                                    {review.images.map((img, idx) => (
                                        <img
                                            key={idx}
                                            src={img.imageUrl}
                                            alt={`Review ${idx + 1}`}
                                            className="review-image"
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Paginação */}
            {hasMore && (
                <div className="reviews-pagination">
                    <button
                        className="btn btn-outline"
                        onClick={() => setCurrentPage(prev => prev + 1)}
                        disabled={loading}
                    >
                        {loading ? 'Carregando...' : 'Carregar Mais Avaliações'}
                    </button>
                </div>
            )}
        </div>
    );
}

export default ProductReviews;
