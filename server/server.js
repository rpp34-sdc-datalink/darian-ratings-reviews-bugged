const express = require('express');
const mongoose = require('mongoose');
const app = express();
const port = 8024;

const {getReviews, getAllReviews, postReview} = require('../NoSQL-DB/no-sql-db.js');

app.use(express.json());

app.get('/reviews', (req, res) => {
  const params = req.query;
  console.log(req.query);

  getReviews(params)
    .then((results) => {
      let response = {
        product: params.product_id,
        page: params.page || 0,
        count: results.length || 5,
        results: results
      };
      res.send(response);
    })
    .catch((err) => {
      console.log('GET Reviews ERROR:', err);
      res.sendStatus(500);
    });

});

app.get('/reviews/meta', (req, res) => {
  const product_id = req.query.product_id;
  let response = {
    product_id: product_id,
    ratings: {},
    recommend: {},
    characteristics: {}
  };

  getAllReviews(product_id)
    .then((results) => {
      let charsAvg = {};
      let charIds = {};

      for (let i = 0; i < results.length; i++) {
        let review = results[i];

        if (response.ratings[review.rating] === undefined) {
          response.ratings[review.rating] = 1;
        } else {
          response.ratings[review.rating] += 1;
        }
        if (response.recommend[review.recommend] === undefined) {
          response.recommend[review.recommend] = 1;
        } else {
          response.recommend[review.recommend] += 1;
        }

        for (let key in review.characteristics) {
          let value = +review.characteristics[key].value;
          let id = +review.characteristics[key].id;
          if (charsAvg[key] === undefined) {
            charsAvg[key] = value;
            charIds[key] = id;
          } else {
            charsAvg[key] += value;
          }
        }
      }

      for (let key in charsAvg) {
        charsAvg[key] = {
          value: charsAvg[key] / results.length,
          id: charIds[key]
        };
      }

      response.characteristics = charsAvg;
      res.send(response);

    });

  /**
   * 1 DB query -> find prodid
   * once we get the results we then filter through and start buliding
   * the response obj
   */

});

app.post('/reviews', (req, res) => {
  let body = req.body;
  console.log('BODY', body);
  postReview(body)
    .then((results) => {
      res.sendStatus(200);
    })
    .catch((err) => {
      console.log('POST ERROR:', err);
      res.sendStatus(500);
    });
});

app.listen(port, () => {
  console.log(`Server Listening on port ${port}`);
});