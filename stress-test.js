import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
  vus: 1,
  duration: '2m',
};

export default function () {
  const getReviews = 'http://localhost:8024/reviews?product_id=904002';
  const getReviewsCount = 'http://localhost:8024/reviews?count=100&product_id=8005';
  const getReviewsSort = 'http://localhost:8024/reviews?sort=helpful&product_id=2210';
  const getReviewsSortCount = 'localhost:8024/reviews?sort=helpful&count=100&product_id=872815';
  const getReviewsMeta = 'http://localhost:8024/reviews/meta?product_id=71699';

  http.get(getReviews);
  sleep(1);

}
