import React, { useState } from 'react';
import { CreateReviewRequest } from '../../types/reviews';
import './ReviewSubmissionForm.css';

interface ReviewSubmissionFormProps {
  productId: string;
  onSubmitSuccess: () => void;
}

export const ReviewSubmissionForm: React.FC<ReviewSubmissionFormProps> = ({
  productId,
  onSubmitSuccess,
}) => {
  const [rating, setRating] = useState<number>(0);
  const [feedback, setFeedback] = useState<string>('');
  const [images, setImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState<string>('');

  const validateForm = (): boolean => {
    const newErrors: string[] = [];

    if (rating < 1 || rating > 5) {
      newErrors.push('Rating must be between 1 and 5 stars');
    }

    if (feedback && (feedback.length < 10 || feedback.length > 1000)) {
      newErrors.push('Feedback must be between 10 and 1000 characters');
    }

    if (images.length > 3) {
      newErrors.push('Maximum 3 images allowed per review');
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSuccessMessage('');

    try {
      const formData = new FormData();
      formData.append('productId', productId);
      formData.append('rating', rating.toString());
      if (feedback) {
        formData.append('feedback', feedback);
      }
      images.forEach((image, index) => {
        formData.append(`images[${index}]`, image);
      });

      // API call will be implemented in task 7
      // const response = await api.post('/api/reviews', formData);

      setSuccessMessage('Review submitted successfully!');
      setRating(0);
      setFeedback('');
      setImages([]);
      onSubmitSuccess();
    } catch (error) {
      setErrors(['Failed to submit review. Please try again.']);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newImages = Array.from(e.target.files);
      if (newImages.length + images.length > 3) {
        setErrors(['Maximum 3 images allowed per review']);
        return;
      }
      setImages([...images, ...newImages]);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  return (
    <div className="review-submission-form">
      <h2>Submit a Review</h2>

      {errors.length > 0 && (
        <div className="error-messages">
          {errors.map((error, index) => (
            <p key={index} className="error-message">
              {error}
            </p>
          ))}
        </div>
      )}

      {successMessage && (
        <div className="success-message">{successMessage}</div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Rating (1-5 stars)</label>
          <div className="star-rating">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className={`star ${rating >= star ? 'active' : ''}`}
                onClick={() => setRating(star)}
              >
                ★
              </button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="feedback">Feedback (optional)</label>
          <textarea
            id="feedback"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Share your experience (10-1000 characters)"
            maxLength={1000}
          />
          <div className="character-counter">
            {feedback.length}/1000
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="images">Upload Images (optional, max 3)</label>
          <input
            id="images"
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp"
            onChange={handleImageChange}
            disabled={images.length >= 3}
          />
          {images.length > 0 && (
            <div className="image-preview">
              {images.map((image, index) => (
                <div key={index} className="image-item">
                  <img
                    src={URL.createObjectURL(image)}
                    alt={`Preview ${index + 1}`}
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="remove-image"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="submit-button"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Review'}
        </button>
      </form>
    </div>
  );
};
