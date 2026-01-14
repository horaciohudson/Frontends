import React, { useState, useEffect } from 'react';
import { Review, ModerationAction } from '../../types/reviews';
import './ModerationPanel.css';

interface ModerationPanelProps {
  onReviewModerated: () => void;
}

export const ModerationPanel: React.FC<ModerationPanelProps> = ({
  onReviewModerated,
}) => {
  const [pendingReviews, setPendingReviews] = useState<Review[]>([]);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [moderationHistory, setModerationHistory] = useState<ModerationAction[]>([]);
  const [statusFilter, setStatusFilter] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // API call will be implemented in task 8
    // fetchPendingReviews();
    setIsLoading(false);
  }, [statusFilter]);

  const fetchPendingReviews = async () => {
    try {
      setIsLoading(true);
      // const response = await api.get('/api/reviews/pending');
      // setPendingReviews(response.data);
    } catch (error) {
      console.error('Failed to fetch pending reviews:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchModerationHistory = async (reviewId: string) => {
    try {
      // const response = await api.get(`/api/reviews/moderation/history/${reviewId}`);
      // setModerationHistory(response.data);
    } catch (error) {
      console.error('Failed to fetch moderation history:', error);
    }
  };

  const handleApprove = async (reviewId: string) => {
    try {
      // await api.post(`/api/reviews/${reviewId}/approve`);
      onReviewModerated();
      setSelectedReview(null);
      setRejectionReason('');
    } catch (error) {
      console.error('Failed to approve review:', error);
    }
  };

  const handleReject = async (reviewId: string) => {
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    try {
      // await api.post(`/api/reviews/${reviewId}/reject`, { reason: rejectionReason });
      onReviewModerated();
      setSelectedReview(null);
      setRejectionReason('');
    } catch (error) {
      console.error('Failed to reject review:', error);
    }
  };

  const handleSelectReview = (review: Review) => {
    setSelectedReview(review);
    fetchModerationHistory(review.id);
  };

  const renderStars = (rating: number) => {
    return (
      <div className="star-display">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star} className={`star ${rating >= star ? 'filled' : ''}`}>
            ★
          </span>
        ))}
      </div>
    );
  };

  if (isLoading) {
    return <div className="loading">Loading reviews...</div>;
  }

  return (
    <div className="moderation-panel">
      <h2>Review Moderation</h2>

      <div className="moderation-container">
        <div className="reviews-list-section">
          <div className="filter-controls">
            <label>Filter by Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
            >
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div className="reviews-list">
            {pendingReviews.length === 0 ? (
              <p className="no-reviews">No reviews to moderate</p>
            ) : (
              pendingReviews.map((review) => (
                <div
                  key={review.id}
                  className={`review-item ${selectedReview?.id === review.id ? 'selected' : ''}`}
                  onClick={() => handleSelectReview(review)}
                >
                  <div className="review-item-header">
                    <h4>{review.customerName}</h4>
                    {renderStars(review.rating)}
                  </div>
                  <p className="review-item-feedback">
                    {review.feedback?.substring(0, 100)}...
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="review-detail-section">
          {selectedReview ? (
            <div className="review-detail">
              <h3>Review Details</h3>

              <div className="detail-content">
                <div className="detail-row">
                  <label>Customer:</label>
                  <span>{selectedReview.customerName}</span>
                </div>

                <div className="detail-row">
                  <label>Rating:</label>
                  <span>{renderStars(selectedReview.rating)}</span>
                </div>

                <div className="detail-row">
                  <label>Date:</label>
                  <span>
                    {new Date(selectedReview.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="detail-row">
                  <label>Feedback:</label>
                  <p className="feedback-text">{selectedReview.feedback}</p>
                </div>

                {selectedReview.images && selectedReview.images.length > 0 && (
                  <div className="detail-row">
                    <label>Images:</label>
                    <div className="detail-images">
                      {selectedReview.images.map((image, index) => (
                        <img
                          key={index}
                          src={image}
                          alt={`Review image ${index + 1}`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="moderation-actions">
                <button
                  className="approve-button"
                  onClick={() => handleApprove(selectedReview.id)}
                >
                  Approve
                </button>

                <div className="rejection-section">
                  <textarea
                    placeholder="Rejection reason (required)"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                  />
                  <button
                    className="reject-button"
                    onClick={() => handleReject(selectedReview.id)}
                  >
                    Reject
                  </button>
                </div>
              </div>

              {moderationHistory.length > 0 && (
                <div className="moderation-history">
                  <h4>Moderation History</h4>
                  {moderationHistory.map((action) => (
                    <div key={action.id} className="history-item">
                      <span className="action-type">{action.action}</span>
                      <span className="action-admin">by {action.adminName}</span>
                      <span className="action-date">
                        {new Date(action.timestamp).toLocaleDateString()}
                      </span>
                      {action.reason && (
                        <p className="action-reason">{action.reason}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="no-selection">
              <p>Select a review to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
