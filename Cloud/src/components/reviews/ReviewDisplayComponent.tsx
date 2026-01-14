import React, { useState, useEffect } from 'react';
import { Review } from '../../types/reviews';
import './ReviewDisplayComponent.css';

interface ReviewDisplayComponentProps {
  productId: string;
  sortBy?: 'recent' | 'helpful';
}

export const ReviewDisplayComponent: React.FC<ReviewDisplayComponentProps> = ({
  productId,
  sortBy = 'recent',
}) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState<number>(0);
  const [totalReviews, setTotalReviews] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(true);
  const itemsPerPage = 5;

  useEffect(() => {
    // API call will be implemented in task 7
    // fetchReviews();
    setIsLoading(false);
  }, [productId]);

  const fetchReviews = async () => {
    try {
      setIsLoading(true);
      // const response = await api.get(`/api/reviews/${productId}`);
      // setReviews(response.data);
      // calculateAverageRating(response.data);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateAverageRating = (reviewList: Review[]) => {
    if (reviewList.length === 0) {
      setAverageRating(0);
      setTotalReviews(0);
      return;
    }

    const sum = reviewList.reduce((acc, review) => acc + review.rating, 0);
    const average = sum / reviewList.length;
    setAverageRating(Math.round(average * 10) / 10);
    setTotalReviews(reviewList.length);
  };

  const sortedReviews = [...reviews].sort((a, b) => {
    if (sortBy === 'recent') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    return 0;
  });

  const paginatedReviews = sortedReviews.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(sortedReviews.length / itemsPerPage);

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

  if (totalReviews === 0) {
    return (
      <div className="review-display-component">
        <div className="no-reviews">
          <p>No reviews available yet. Be the first to review this product!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="review-display-component">
      <div className="reviews-header">
        <div className="rating-summary">
          <div className="average-rating">
            <span className="rating-number">{averageRating}</span>
            <div className="rating-stars">{renderStars(Math.round(averageRating))}</div>
            <span className="review-count">({totalReviews} reviews)</span>
          </div>
        </div>
      </div>

      <div className="reviews-list">
        {paginatedReviews.map((review) => (
          <div key={review.id} className="review-card">
            <div className="review-header">
              <div className="reviewer-info">
                <h4 className="reviewer-name">{review.customerName}</h4>
                <div className="review-meta">
                  {renderStars(review.rating)}
                  <span className="review-date">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {review.feedback && (
              <p className="review-feedback">{review.feedback}</p>
            )}

            {review.images && review.images.length > 0 && (
              <div className="review-images">
                {review.images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Review image ${index + 1}`}
                    className="review-image"
                  />
                ))}
              </div>
            )}

            {review.isEdited && (
              <p className="edited-note">
                Edited on {new Date(review.editedAt!).toLocaleDateString()}
              </p>
            )}
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="pagination-button"
          >
            Previous
          </button>
          <span className="pagination-info">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="pagination-button"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};
