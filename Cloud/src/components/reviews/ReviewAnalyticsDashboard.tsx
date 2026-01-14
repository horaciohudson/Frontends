import React, { useState, useEffect } from 'react';
import { ReviewAnalytics } from '../../types/reviews';
import './ReviewAnalyticsDashboard.css';

interface ReviewAnalyticsDashboardProps {
  productId?: string;
}

export const ReviewAnalyticsDashboard: React.FC<ReviewAnalyticsDashboardProps> = ({
  productId,
}) => {
  const [analytics, setAnalytics] = useState<ReviewAnalytics | null>(null);
  const [startDate, setStartDate] = useState<string>(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // API call will be implemented in task 9
    // fetchAnalytics();
    setIsLoading(false);
  }, [productId, startDate, endDate]);

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);
      // const response = await api.get(`/api/analytics/reviews${productId ? `/${productId}` : ''}`, {
      //   params: { startDate, endDate }
      // });
      // setAnalytics(response.data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="loading">Loading analytics...</div>;
  }

  if (!analytics) {
    return <div className="no-data">No analytics data available</div>;
  }

  const ratingPercentages = {
    oneStar: analytics.totalReviews > 0 
      ? (analytics.ratingDistribution.oneStar / analytics.totalReviews) * 100 
      : 0,
    twoStar: analytics.totalReviews > 0 
      ? (analytics.ratingDistribution.twoStar / analytics.totalReviews) * 100 
      : 0,
    threeStar: analytics.totalReviews > 0 
      ? (analytics.ratingDistribution.threeStar / analytics.totalReviews) * 100 
      : 0,
    fourStar: analytics.totalReviews > 0 
      ? (analytics.ratingDistribution.fourStar / analytics.totalReviews) * 100 
      : 0,
    fiveStar: analytics.totalReviews > 0 
      ? (analytics.ratingDistribution.fiveStar / analytics.totalReviews) * 100 
      : 0,
  };

  return (
    <div className="review-analytics-dashboard">
      <h2>Review Analytics</h2>

      <div className="date-filter">
        <label>
          Start Date:
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </label>
        <label>
          End Date:
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </label>
      </div>

      <div className="analytics-grid">
        <div className="analytics-card">
          <h3>Average Rating</h3>
          <div className="metric-value">{analytics.averageRating.toFixed(1)}</div>
          <div className="metric-label">out of 5 stars</div>
        </div>

        <div className="analytics-card">
          <h3>Total Reviews</h3>
          <div className="metric-value">{analytics.totalReviews}</div>
          <div className="metric-label">reviews</div>
        </div>
      </div>

      <div className="rating-distribution">
        <h3>Rating Distribution</h3>
        <div className="distribution-bars">
          {[
            { stars: 5, count: analytics.ratingDistribution.fiveStar, percentage: ratingPercentages.fiveStar },
            { stars: 4, count: analytics.ratingDistribution.fourStar, percentage: ratingPercentages.fourStar },
            { stars: 3, count: analytics.ratingDistribution.threeStar, percentage: ratingPercentages.threeStar },
            { stars: 2, count: analytics.ratingDistribution.twoStar, percentage: ratingPercentages.twoStar },
            { stars: 1, count: analytics.ratingDistribution.oneStar, percentage: ratingPercentages.oneStar },
          ].map((item) => (
            <div key={item.stars} className="distribution-row">
              <span className="star-label">{item.stars} ★</span>
              <div className="bar-container">
                <div
                  className="bar"
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
              <span className="count-label">
                {item.count} ({item.percentage.toFixed(1)}%)
              </span>
            </div>
          ))}
        </div>
      </div>

      {analytics.trends && analytics.trends.length > 0 && (
        <div className="trends-section">
          <h3>Rating Trends</h3>
          <div className="trends-table">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Average Rating</th>
                  <th>Review Count</th>
                </tr>
              </thead>
              <tbody>
                {analytics.trends.map((trend, index) => (
                  <tr key={index}>
                    <td>{new Date(trend.date).toLocaleDateString()}</td>
                    <td>{trend.averageRating.toFixed(1)}</td>
                    <td>{trend.reviewCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
