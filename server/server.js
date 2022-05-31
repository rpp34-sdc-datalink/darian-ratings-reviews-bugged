const express = require('express');
const mongoose = require('mongoose');
const app = express();
const port = 8024;

const {getReviews} = require('../NoSQL-DB/no-sql-db.js');

app.use(express.json());

app.get('/reviews', (req, res) => {
  const params = req.query;
  console.log(req.query);

  getReviews(params)
    .then((results) => {
      res.send(results);
    })
    .catch((err) => {
      console.log('GET Reviews ERROR:', err);
      res.sendStatus(500);
    });

});

app.listen(port, () => {
  console.log(`Server Listening on port ${port}`);
});