const {Schema, model, mongoose} = require('mongoose');
const {saveReview} = require('./no-sql-db.js');
const fs = require('fs');
const path = require('path');

const etlReviews = (csv) => {
  let csvArr = csv.split('\n');
  console.log('te', csvArr[0])
  csvArr = csvArr.slice(1);

  let review_id, product_id, rating, date, summary, body, recommend, reported, reviewer_name, reviewer_email, response, helpfulness;
  let saveReviewPromises = [];

  csvArr.forEach((data) => {
    let firstLine = data.split(',');
    [review_id, product_id, rating, date, summary, body, recommend, reported, reviewer_name, reviewer_email, response, helpfulness] = firstLine;
    saveReviewPromises.push(saveReview({review_id, product_id, rating, date, summary, body, recommend, reported, reviewer_name, reviewer_email, response, helpfulness}, 'reviews'))
    })

  Promise.all(saveReviewPromises)
    .then(()=> {
      console.log('saved')
    })
    .catch((err) => {
      console.log('err', err)
    })
}

const etlReviewPhotos = (csv) => {
  let csvArr = csv.split('\n');
  csvArr = csvArr.slice(1);
  let id, review_id, url;
  let saveReviewPhotosPromises = [];

  csvArr.forEach((photoData) => {
    let firstLine = photoData.split(',');
    [id, review_id, url] = firstLine;
    saveReviewPhotosPromises.push(saveReview({id, review_id, url}, 'reviewPhotos'))
  })

  Promise.all(saveReviewPhotosPromises)
    .then(()=> {
      console.log('saved')
    })
    .catch((err) => {
      console.log('err', err)
    })
}

fs.readFile(path.resolve(__dirname, '../SDC-app-data/csv-test/reviews-test.csv'), 'utf8', (err, data) => {
  if (err) {
    console.log('err', err)
  } else {
    etlReviews(data)
  }
});

fs.readFile(path.resolve(__dirname, '../SDC-app-data/csv-test/review-photos.csv'), 'utf8', (err, data) => {
  if (err) {
    console.log('err', err)
  } else {
    etlReviewPhotos(data)
  }
});

module.exports = {etlReviews}

