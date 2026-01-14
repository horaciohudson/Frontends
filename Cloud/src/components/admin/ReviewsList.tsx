import { useState, useEffect } from 'react';
import { reviewsAPI } from '../../services/api';
import { useNotification } from '../../contexts/NotificationContext';
import Pagination from '../common/Pagination';
import './ReviewsList.css';

interface Review {
    id: number;
    productName: string;
    customerName: string;
    rating: number;
    feedback: string;
    status: string;
    flaggedForReview: boolean;
    flagReason?: string;
    createdAt: string;
}

function ReviewsList() {
    const { showNotification } = useNotification();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [selectedReview, setSelectedReview] = useState<Review | null>(null);

    useEffect(() => {
        loadReviews();
    }, [currentPage]);

    const loadReviews = async () => {
        try {
            setLoading(true);
            const response = await reviewsAPI.getAll(currentPage, 20);
            const data = response.data.data;
            
            setReviews(data.content || []);
            setTotalPages(data.totalPages || 0);
        } catch (err) {
            console.error('Error loading reviews:', err);
            showNotification('error', 'Erro ao carregar avaliações');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Tem certeza que deseja excluir esta avaliação?')) {
            return;
        }

        try {
            await reviewsAPI.delete(id);
            showNotification('success', 'Avaliação excluída com sucesso');
            loadReviews();
        } catch (err) {
            console.error('Error deleting review:', err);
            showNotification('error', 'Erro ao excluir avaliação');
        }
    };

    const renderStars = (rating: number) => {
        return (
            <div className="stars">
                {[1, 2, 3, 4, 5].map(star => (
                    <span
                        key={star}
                        className={`star ${star <= rating ? 'filled' : ''}`}
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
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusBadge = (status: string) => {
        const statusMap: Record<string, { label: string; className: string }> = {
            'APPROVED': { label: 'Aprovado', className: 'approved' },
            'PENDING': { label: 'Pendente', className: 'pending' },
            'REJECTED': { label: 'Rejeitado', className: 'rejected' }
        };

        const statusInfo = statusMap[status] || { label: status, className: 'default' };
        return <span className={`status-badge ${statusInfo.className}`}>{statusInfo.label}</span>;
    };

    if (loading && reviews.length === 0) {
        return (
            <div className="reviews-list-container">
                <div className="reviews-header">
                    <h2>⭐ Gerenciar Avaliações</h2>
                </div>
                <div className="loading">Carregando avaliações...</div>
            </div>
        );
    }

    return (
        <div className="reviews-list-container">
            <div className="reviews-header">
                <div>
                    <h2>⭐ Gerenciar Avaliações</h2>
                    <p>Visualize e gerencie as avaliações dos produtos</p>
                </div>
            </div>

            {reviews.length === 0 ? (
                <div className="empty-state">
                    <p>Nenhuma avaliação encontrada</p>
                </div>
            ) : (
                <>
                    <div className="reviews-table-container">
                        <table className="reviews-table">
                            <thead>
                                <tr>
                                    <th>Produto</th>
                                    <th>Cliente</th>
                                    <th>Avaliação</th>
                                    <th>Status</th>
                                    <th>Data</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reviews.map(review => (
                                    <tr key={review.id} className={review.flaggedForReview ? 'flagged' : ''}>
                                        <td>
                                            <div className="product-info">
                                                <span className="product-name">{review.productName}</span>
                                                {review.flaggedForReview && (
                                                    <span className="flag-badge" title={review.flagReason}>
                                                        🚩 Sinalizado
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td>{review.customerName}</td>
                                        <td>
                                            <div className="rating-cell">
                                                {renderStars(review.rating)}
                                                <span className="rating-number">{review.rating}/5</span>
                                            </div>
                                        </td>
                                        <td>{getStatusBadge(review.status)}</td>
                                        <td className="date-cell">{formatDate(review.createdAt)}</td>
                                        <td>
                                            <div className="action-buttons">
                                                <button
                                                    className="btn-icon btn-view"
                                                    onClick={() => setSelectedReview(review)}
                                                    title="Ver detalhes"
                                                >
                                                    👁️
                                                </button>
                                                <button
                                                    className="btn-icon btn-delete"
                                                    onClick={() => handleDelete(review.id)}
                                                    title="Excluir"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {totalPages > 1 && (
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                        />
                    )}
                </>
            )}

            {/* Modal de Detalhes */}
            {selectedReview && (
                <div className="modal-overlay" onClick={() => setSelectedReview(null)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Detalhes da Avaliação</h3>
                            <button className="close-btn" onClick={() => setSelectedReview(null)}>
                                ✕
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="detail-row">
                                <strong>Produto:</strong>
                                <span>{selectedReview.productName}</span>
                            </div>
                            <div className="detail-row">
                                <strong>Cliente:</strong>
                                <span>{selectedReview.customerName}</span>
                            </div>
                            <div className="detail-row">
                                <strong>Avaliação:</strong>
                                <div className="rating-detail">
                                    {renderStars(selectedReview.rating)}
                                    <span>{selectedReview.rating}/5</span>
                                </div>
                            </div>
                            <div className="detail-row">
                                <strong>Status:</strong>
                                {getStatusBadge(selectedReview.status)}
                            </div>
                            <div className="detail-row">
                                <strong>Data:</strong>
                                <span>{formatDate(selectedReview.createdAt)}</span>
                            </div>
                            {selectedReview.flaggedForReview && (
                                <div className="detail-row flagged-detail">
                                    <strong>🚩 Sinalizado:</strong>
                                    <span>{selectedReview.flagReason}</span>
                                </div>
                            )}
                            <div className="detail-row full-width">
                                <strong>Comentário:</strong>
                                <p className="feedback-text">{selectedReview.feedback}</p>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button
                                className="btn btn-danger"
                                onClick={() => {
                                    handleDelete(selectedReview.id);
                                    setSelectedReview(null);
                                }}
                            >
                                Excluir Avaliação
                            </button>
                            <button
                                className="btn btn-outline"
                                onClick={() => setSelectedReview(null)}
                            >
                                Fechar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ReviewsList;
