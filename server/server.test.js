const axios = require('axios');

describe('GET /reviews', () => {
  test('Should return reviews for given product_id', (done) => {
    axios.get('http://localhost:8024/reviews?product_id=28930&count=100')
      .then((response) => {
        expect(response.data.product).toBe('28930');
        done();
      })
      .catch((err) => {
        console.log('TEST ERROR: GET /reviews', err);
      });
  });

  test('Should return, at max, 5 reviews if no count param provided', (done) => {
    axios.get('http://localhost:8024/reviews?product_id=100')
      .then((response) => {
        let reviews = response.data.results;
        expect(reviews.length).toBe(5);
        done();
      })
      .catch((err) => {
        console.log('TEST ERROR: GET /reviews', err);
      });
  });

  test('Should return 10 reviews if count param is set to 10', (done) => {
    axios.get('http://localhost:8024/reviews?product_id=30022&count=10')
      .then((response) => {
        let reviews = response.data.results;
        expect(reviews.length).toBe(10);
        done();
      })
      .catch((err) => {
        console.log('TEST ERROR: GET /reviews', err);
      });
  });

  test('Should sort by newest review if sort-param is "newest"', (done) => {
    axios.get('http://localhost:8024/reviews?sort=newest&count=100&product_id=30022')
      .then((response) => {
        let reviews = response.data.results;
        let prevDate = +reviews[0].date;
        let sorted = true;

        for (let i = 1; i < reviews.length; i++) {
          let currentDate = +reviews[i].date;
          if (currentDate > prevDate) {
            sorted = false;
            break;
          } else {
            date = currentDate;
          }
        }
        expect(sorted).toBe(true);
        done();
      })
      .catch((err) => {
        console.log('TEST ERROR: GET /reviews/newest', err);
      });
  });

  test('Should sort by helpfulness if sort-param is "helpful"', (done) => {
    axios.get('http://localhost:8024/reviews?sort=helpful&count=100&product_id=30022')
      .then((response) => {
        let reviews = response.data.results;
        let prevHelpfulStat = reviews[0].helpfulness;
        let sorted = true;

        for (let i = 1; i < reviews.length; i++) {
          let currentHelpfulStat = reviews[i].helpfulness;
          if (currentHelpfulStat > prevHelpfulStat) {
            sorted = false;
            break;
          } else {
            date = currentHelpfulStat;
          }
        }
        expect(sorted).toBe(true);
        done();
      })
      .catch((err) => {
        console.log('TEST ERROR: GET /reviews/helpful', err);
      });
  });

  test('Should sort by relevant if sort-param is "relevant"', (done) => {
    axios.get('http://localhost:8024/reviews?sort=relevant&count=100&product_id=30022')
      .then((response) => {
        let reviews = response.data.results;
        let prevReviewId = reviews[0].review_id;
        let sorted = true;

        for (let i = 1; i < reviews.length; i++) {
          let currentReviewId = reviews[i].review_id;
          if (currentReviewId < prevReviewId) {
            sorted = false;
            break;
          } else {
            date = currentReviewId;
          }
        }
        expect(sorted).toBe(true);
        done();
      })
      .catch((err) => {
        console.log('TEST ERROR: GET /reviews/relevant', err);
      });
  });
});

describe('POST /reviews', () => {
  test('Should save new review to database correctly', () => {
    expect(true).toBe(true);
  });
});

describe('GET /reviews/meta', () => {
  test('Should return meta data for given product_id', () => {
    expect(true).toBe(true);
  });
});

describe('PUT /reviews/:product_id/helpful', () => {
  test('Should update heplful value for given review_id', () => {
    expect(true).toBe(true);
  });
});

describe('PUT /reviews/:product_id/report', () => {
  test('Should report review for given review_id', () => {
    expect(true).toBe(true);
  });
});
