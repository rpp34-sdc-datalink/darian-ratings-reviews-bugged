const express = require('express');
const mongoose = require('mongoose');
const app = express();
const cors = require('cors');
const port = 8024;

const {getReviews, getAllReviews, postReview, helpful, report, deleteReview} = require('../NoSQL-DB/no-sql-db.js');

app.use(express.json());
app.use(cors());

app.get('/reviews', (req, res) => {
  const params = req.query;
  getReviews(params)
    .then((results) => {
      if (results.length === 0) {
        res.status(404).send('This product does not exist.');
      } else {
        let response = {
          product: params.product_id,
          page: params.page || 0,
          count: results.length || 5,
          results: results
        };
        for (let i = 0; i < results.length; i++) {
          response.results[i].date = new Date(+results[i].date).toISOString();
        }
        res.send(response);
      }
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
    recommended: {},
    characteristics: {}
  };

  getAllReviews(product_id)
    .then((results) => {
      if (results.length === 0) {
        res.status(404).send('This product does not exist.');
      } else {
        let charsAvg = {};
        let charIds = {};

        for (let i = 0; i < results.length; i++) {
          let review = results[i];

          if (response.ratings[review.rating] === undefined) {
            response.ratings[review.rating] = 1;
          } else {
            response.ratings[review.rating] += 1;
          }
          if (response.recommended[review.recommend] === undefined) {
            response.recommended[review.recommend] = 1;
          } else {
            response.recommended[review.recommend] += 1;
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
      }

    })
    .catch((err) => {
      console.log('GET reviews/meta ERROR:', err);
      res.sendStatus(500);
    });
});

app.post('/reviews', (req, res) => {
  postReview(req.body)
    .then((results) => {
      if (results === 'This product does not exist.') {
        res.status(404).send('This product does not exist.');
      } else {
        res.sendStatus(201);
      }
    })
    .catch((err) => {
      console.log('POST ERROR:', err);
      res.sendStatus(500);
    });
});

app.put('/reviews/:review_id/helpful', (req, res) => {
  const id = req.params.review_id;
  helpful(id)
    .then(() => {
      res.sendStatus(204);
    })
    .catch((err) => {
      console.log('PUT helpful ERROR:', err);
      res.sendStatus(500);
    });
});

app.put('/reviews/:review_id/report', (req, res) => {
  const id = req.params.review_id;
  report(id)
    .then(() => {
      res.sendStatus(204);
    })
    .catch((err) => {
      console.log('PUT report ERROR:', err);
      res.sendStatus(500);
    });
});

app.delete('/reviews/:review_id', (req, res) => {
  const id = req.params.review_id;

  deleteReview(id)
    .then(() => {
      res.sendStatus(204);
    })
    .catch((err) => {
      console.log('DELETE Review ERROR:', err);
      res.sendStatus(500);
    });
});

app.listen(port, () => {
  console.log(`Server Listening on port ${port}`);
});

module.exports = app;