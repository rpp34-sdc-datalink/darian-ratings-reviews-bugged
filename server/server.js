const express = require('express');
const mongoose = require('mongoose');
const app = express();
const port = 8024;

const {getReviews, getAllReviews} = require('../NoSQL-DB/no-sql-db.js');

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
      results.forEach((review) => {
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
      });
      res.send(response);

    });

  /**
   * 1 DB query -> find prodid
   * once we get the results we then filter through and start buliding
   * the response obj
   */

});

app.listen(port, () => {
  console.log(`Server Listening on port ${port}`);
});