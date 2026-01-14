// Review Entity
export interface Review {
  id: string;
  productId: string;
  customerId: string;
  customerName: string;
  rating: number; // 1-5
  feedback?: string; // 10-1000 characters
  images?: string[]; // Array of image URLs (0-3)
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
  isEdited: boolean;
  editedAt?: Date;
  flaggedForReview: boolean;
  flagReason?: string;
}

// ModerationAction Entity
export interface ModerationAction {
  id: string;
  reviewId: string;
  adminId: string;
  adminName: string;
  action: 'approved' | 'rejected';
  reason?: string; // For rejections
  timestamp: Date;
}

// ReviewAnalytics Entity
export interface ReviewAnalytics {
  productId: string;
  averageRating: number;
  totalReviews: number;
  ratingDistribution: RatingDistribution;
  trends: RatingTrend[];
}

export interface RatingDistribution {
  oneStar: number;
  twoStar: number;
  threeStar: number;
  fourStar: number;
  fiveStar: number;
}

export interface RatingTrend {
  date: Date;
  averageRating: number;
  reviewCount: number;
}

// DTOs for API communication
export interface CreateReviewRequest {
  productId: string;
  customerId: string;
  rating: number;
  feedback?: string;
  images?: File[];
}

export interface UpdateReviewRequest {
  rating: number;
  feedback?: string;
  images?: File[];
}

export interface ReviewResponse {
  id: string;
  productId: string;
  customerId: string;
  customerName: string;
  rating: number;
  feedback?: string;
  images?: string[];
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export interface ModerationActionRequest {
  action: 'approve' | 'reject';
  reason?: string;
}

export interface ReviewAnalyticsResponse {
  productId: string;
  averageRating: number;
  totalReviews: number;
  ratingDistribution: RatingDistribution;
  trends: RatingTrend[];
}
