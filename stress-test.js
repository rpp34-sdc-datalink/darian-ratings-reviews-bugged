import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
  vus: 1000,
  duration: '1m',
  discardResponseBodies: true
};

export default function () {
  let id = Math.floor(Math.random() * (1000000 - 7000) + 7000);
  let review_id = Math.floor(Math.random() * (5700000 - 40000) + 40000);
  const getReviews = `http://localhost:8024/reviews?product_id=${id}`;
  const getReviewsCount = `http://localhost:8024/reviews?count=100&product_id=${id}`;
  const getReviewsSort = `http://localhost:8024/reviews?sort=helpful&product_id=${id}`;
  const getReviewsMeta = `http://localhost:8024/reviews/meta?product_id=${id}`;
  const postReview = 'http://localhost:8024/reviews';
  const putHelpful = `http://localhost:8024/reviews/${review_id}/helpful`;
  const putReport = `http://localhost:8024/reviews/${review_id}/report`;

  const postData = {
    'product_id': id,
    'rating': 4,
    'summary': 'This is okie doke',
    'body': 'lsjfdj dsjflsidj ghew wefj dsljfks wqejij snd sdjsdjiwe ijsjfisjl fijsij fsijfjis wiejjg',
    'recommended': true,
    'name': 'Johny-2x',
    'email': 'johnjohn@jj.com',
    'photos': ['https://upload.wikimedia.org/wikipedia/commons/7/7a/Basketball.png'],
    'characteristics': {
      '5590879': 5,
      '5590880': 5,
      '5590881': 5,
      '5590882': 5
    }
  };

  const headers = {
    'Content-Type': 'application/json'
  };

  // http.get(getReviews);
  http.post(postReview, JSON.stringify(postData), { headers: {
    'Content-Type': 'application/json'
  }});
  // http.put(putReport);
  sleep(1);

}
