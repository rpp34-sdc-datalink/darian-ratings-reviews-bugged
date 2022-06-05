import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
  vus: 1,
  duration: '30s',
};

export default function () {
  http.get('http://localhost:8024/reviews?count=100&product_id=800555');
  sleep(1);

}
